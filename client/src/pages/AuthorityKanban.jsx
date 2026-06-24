import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issuesApi } from '@api/issues.api';
import { useSocket } from '@context/SocketContext';
import { useGeolocation } from '@hooks/useGeolocation';
import { CATEGORY_ICONS, STATUS_LABELS, SEVERITY_COLORS, timeAgo, cn } from '@utils/helpers';
import toast from 'react-hot-toast';
import { Clock, MapPin, AlertTriangle } from 'lucide-react';

const COLUMNS = [
  { id: 'open', title: 'Open / Unassigned', bgColor: 'bg-slate-500/10' },
  { id: 'in_progress', title: 'In Progress', bgColor: 'bg-warning-500/10' },
  { id: 'escalated', title: 'Escalated', bgColor: 'bg-danger-500/10' },
  { id: 'resolved', title: 'Resolved', bgColor: 'bg-success-500/10' },
];

function IssueCard({ issue, index }) {
  return (
    <Draggable draggableId={issue._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            'p-4 rounded-xl border mb-3 transition-all cursor-grab active:cursor-grabbing shadow-sm',
            snapshot.isDragging ? 'bg-dark-800 border-primary-500/50 shadow-glow-sm' : 'bg-dark-800/80 border-white/5 hover:border-white/20'
          )}
        >
          <div className="flex items-start justify-between mb-2">
            <span className="text-xl shrink-0 mr-2">{CATEGORY_ICONS[issue.category]}</span>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white truncate">{issue.title}</h4>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Clock size={10} /> {timeAgo(issue.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
            <div className={cn("text-xs px-2 py-0.5 rounded-full font-medium", SEVERITY_COLORS[issue.severity])}>
              {issue.severityScore}/100 Severity
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin size={10} /> {issue.location?.city || 'Unknown'}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default function AuthorityKanban() {
  const queryClient = useQueryClient();
  const socket = useSocket();
  const { location } = useGeolocation();
  
  const [columns, setColumns] = useState({
    open: [],
    in_progress: [],
    escalated: [],
    resolved: []
  });

  const { data, isLoading } = useQuery({
    queryKey: ['authority_issues'],
    queryFn: () => issuesApi.getAll({ limit: 100 }), // Get all active issues
  });

  // Organize issues into columns
  useEffect(() => {
    if (data?.data) {
      const newCols = { open: [], in_progress: [], escalated: [], resolved: [] };
      data.data.forEach(issue => {
        if (newCols[issue.status]) {
          newCols[issue.status].push(issue);
        } else if (issue.status === 'closed') {
          // ignore closed
        } else {
          newCols.open.push(issue);
        }
      });
      setColumns(newCols);
    }
  }, [data?.data]);

  // Real-time updates
  useEffect(() => {
    if (!socket) return;
    
    // Broadcast location to War Room / Dashboard
    let interval;
    if (location) {
      interval = setInterval(() => {
        socket.emit('officer:location_update', location);
      }, 10000); // every 10s
    }

    const handleIssueUpdate = (updatedIssue) => {
      queryClient.invalidateQueries(['authority_issues']);
    };
    
    socket.on('issue:created', handleIssueUpdate);
    socket.on('issue:status-changed', handleIssueUpdate);

    return () => {
      if (interval) clearInterval(interval);
      socket.off('issue:created', handleIssueUpdate);
      socket.off('issue:status-changed', handleIssueUpdate);
    };
  }, [socket, location, queryClient]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => issuesApi.updateStatus(id, { status }),
    onSuccess: () => {
      toast.success('Issue status updated');
    },
    onError: () => {
      toast.error('Failed to update status');
      queryClient.invalidateQueries(['authority_issues']); // revert
    }
  });

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    // Dropped outside the list
    if (!destination) return;

    // Dropped in the same place
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Optimistic UI Update
    const sourceColumn = [...columns[source.droppableId]];
    const destColumn = [...columns[destination.droppableId]];
    const [movedIssue] = sourceColumn.splice(source.index, 1);
    
    if (source.droppableId === destination.droppableId) {
      sourceColumn.splice(destination.index, 0, movedIssue);
      setColumns({ ...columns, [source.droppableId]: sourceColumn });
    } else {
      movedIssue.status = destination.droppableId;
      destColumn.splice(destination.index, 0, movedIssue);
      setColumns({
        ...columns,
        [source.droppableId]: sourceColumn,
        [destination.droppableId]: destColumn
      });
      
      // Hit API
      updateStatusMutation.mutate({ id: draggableId, status: destination.droppableId });
    }
  };

  if (isLoading) return <div className="p-8 text-white">Loading Kanban...</div>;

  return (
    <div className="h-[calc(100vh-4rem)] p-6 bg-dark-900 overflow-x-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Authority Field Queue</h1>
        <p className="text-slate-400 text-sm">Drag and drop issues to update their status and notify reporters.</p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 h-[calc(100%-80px)] min-w-[1000px]">
          {COLUMNS.map((col) => (
            <div key={col.id} className={cn("flex flex-col w-80 rounded-2xl border border-white/5", col.bgColor)}>
              <div className="p-4 flex items-center justify-between border-b border-white/5">
                <h3 className="font-semibold text-white">{col.title}</h3>
                <span className="text-xs bg-dark-900 px-2 py-1 rounded-full text-slate-300 border border-white/10">
                  {columns[col.id]?.length || 0}
                </span>
              </div>
              
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'flex-1 p-3 overflow-y-auto transition-colors min-h-[150px]',
                      snapshot.isDraggingOver ? 'bg-white/5' : ''
                    )}
                  >
                    {columns[col.id]?.map((issue, index) => (
                      <IssueCard key={issue._id} issue={issue} index={index} />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
