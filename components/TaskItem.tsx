
import React from 'react';
import { Task } from '../types';
import { Calendar, Trash2, CheckCircle, Circle, AlertCircle, Clock } from 'lucide-react';
import { formatLocalTime } from '../utils';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  const isOverdue = new Date(task.dueDate) < new Date() && !task.completed;
  
  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'High': return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${task.completed ? 'bg-slate-50 border-slate-200 opacity-75' : 'bg-white border-slate-200'}`}>
      <div className="flex items-start gap-3">
        <button 
          onClick={() => onToggle(task.id, !task.completed)}
          className={`mt-1 flex-shrink-0 transition-colors ${task.completed ? 'text-green-500' : 'text-slate-300 hover:text-orange-500'}`}
        >
          {task.completed ? <CheckCircle size={24} className="fill-current" /> : <Circle size={24} />}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4 className={`text-base font-semibold truncate ${task.completed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
              {task.title}
            </h4>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>
          
          {task.description && (
            <p className={`text-sm mt-1 line-clamp-2 ${task.completed ? 'text-slate-400' : 'text-slate-600'}`}>
              {task.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 mt-3 text-xs">
            <div className={`flex items-center gap-1 font-medium ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
              <Calendar size={14} />
              {formatLocalTime(task.dueDate)}
              {isOverdue && <span className="flex items-center gap-0.5 ml-1"><AlertCircle size={12} /> Overdue</span>}
            </div>
            {!task.completed && (
                 <div className="flex items-center gap-1 text-slate-400">
                    <Clock size={14} /> Created {new Date(task.createdAt).toLocaleDateString()}
                 </div>
            )}
          </div>
        </div>

        <button 
          onClick={() => onDelete(task.id)}
          className="text-slate-300 hover:text-red-500 transition-colors p-1"
          title="Delete Task"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
