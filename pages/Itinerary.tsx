
import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Plus, SortAsc, Calendar as CalendarIcon, ClipboardList, Filter } from 'lucide-react';
import TaskItem from '../components/TaskItem';
import { TaskPriority } from '../types';

const Itinerary: React.FC = () => {
  const { user, tasks, addTask, updateTask, deleteTask } = useAuth();
  
  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('12:00');

  // Filter/Sort State
  const [sortBy, setSortBy] = useState<'created' | 'dueDate' | 'priority'>('created');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'All'>('All');

  if (!user) return <Navigate to="/" replace />;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;
    
    const dueDateTime = new Date(`${date}T${time}`).toISOString();

    addTask({
      title,
      description: desc,
      priority,
      dueDate: dueDateTime
    });
    
    // Reset
    setTitle('');
    setDesc('');
    setPriority('Medium');
    setDate('');
    setIsAdding(false);
  };

  // Sorting Logic
  const processedTasks = useMemo(() => {
    let result = [...tasks];

    // Filter
    if (filterPriority !== 'All') {
      result = result.filter(t => t.priority === filterPriority);
    }

    // Sort
    result.sort((a, b) => {
      // Always move completed to bottom
      if (a.completed !== b.completed) return a.completed ? 1 : -1;

      if (sortBy === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'priority') {
        const pMap = { High: 3, Medium: 2, Low: 1 };
        return pMap[b.priority] - pMap[a.priority];
      }
      // Default: Created (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [tasks, sortBy, filterPriority]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <ClipboardList className="text-orange-600" /> Trip Itinerary
            </h1>
            <p className="text-slate-500 mt-1">Manage your tasks, deadlines, and packing lists.</p>
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
             {isAdding ? 'Cancel' : <><Plus size={20} /> Add Task</>}
          </button>
        </div>

        {/* Add Form */}
        {isAdding && (
          <div className="bg-white rounded-xl shadow-lg border border-orange-100 p-6 mb-8 animate-fade-in-up">
            <h3 className="font-bold text-lg text-slate-800 mb-4">New Task</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Task Title *</label>
                <input 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  placeholder="e.g. Buy Concert Tickets"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                <textarea 
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                  placeholder="Add details..."
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Due Date *</label>
                    <input 
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                      required
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Time</label>
                    <input 
                      type="time"
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Priority</label>
                    <select 
                      value={priority}
                      onChange={e => setPriority(e.target.value as TaskPriority)}
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                 </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-800 transition-colors">
                  Save Task
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-2">
              <SortAsc size={18} className="text-slate-400" />
              <span className="text-sm font-semibold text-slate-600">Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border-none bg-transparent font-medium text-orange-600 focus:ring-0 cursor-pointer"
              >
                <option value="created">Created Date</option>
                <option value="dueDate">Due Date (Soonest)</option>
                <option value="priority">Priority (High-Low)</option>
              </select>
           </div>
           
           <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <Filter size={18} className="text-slate-400" />
              <select 
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as any)}
                className="text-sm border-none bg-transparent font-medium text-slate-600 focus:ring-0 cursor-pointer"
              >
                <option value="All">All Priorities</option>
                <option value="High">High Only</option>
                <option value="Medium">Medium Only</option>
                <option value="Low">Low Only</option>
              </select>
           </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {processedTasks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
               <CalendarIcon className="mx-auto text-slate-300 mb-3" size={48} />
               <p className="text-slate-500 font-medium">No tasks found.</p>
               <p className="text-sm text-slate-400">Add a task to start planning!</p>
            </div>
          ) : (
            processedTasks.map(task => (
              /* FIX: Wrapped updateTask to match TaskItem's onToggle signature (id, completed) */
              <TaskItem 
                key={task.id} 
                task={task} 
                onToggle={(id, completed) => updateTask(id, { completed })}
                onDelete={deleteTask}
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default Itinerary;
