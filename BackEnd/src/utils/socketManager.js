// Socket.IO instance manager
// This allows access to the Socket.IO instance from controllers and models

let socketInstance = null;

// Helper function to convert Buffer to UUID
function bufferToUuid(buffer) {
  if (!buffer || buffer.length !== 16) return null
  const hex = Array.from(buffer, byte => byte.toString(16).padStart(2, '0')).join('')
  return [
    hex.substring(0, 8),
    hex.substring(8, 12),
    hex.substring(12, 16),
    hex.substring(16, 20),
    hex.substring(20, 32)
  ].join('-')
}

export const setSocketInstance = (io) => {
  socketInstance = io;
  console.log('✅ Socket.IO instance set in manager');
};

export const getSocketInstance = () => {
  if (!socketInstance) {
    console.warn('⚠️ Socket.IO instance not available');
  }
  return socketInstance;
};

// Helper function to emit task completion events
export const emitTaskCompleted = async (taskData, objectiveData = null) => {
  const io = getSocketInstance();
  if (!io) return;

  console.log('📡 Emitting task_completed event:', taskData);
  
  // Convert group_id buffer to UUID string if needed
  const groupId = objectiveData?.group_id ? 
    (Buffer.isBuffer(objectiveData.group_id) ? bufferToUuid(objectiveData.group_id) : objectiveData.group_id) : 
    null;

  console.log('📡 Converted group_id for emission:', groupId);
  
  // Emit to the specific group if available
  if (groupId) {
    io.to(groupId).emit('task_completed', {
      id: taskData.id,
      title: taskData.title,
      objective_id: taskData.objective_id,
      objective_title: objectiveData.title,
      completed_by: taskData.assigned_to_name || 'Unknown',
      group_id: groupId,
      completed_at: taskData.completed_at
    });
    console.log('📡 Task completed event emitted to group:', groupId);
  } else {
    // Fallback to global emit
    io.emit('task_completed', {
      id: taskData.id,
      title: taskData.title,
      objective_id: taskData.objective_id,
      objective_title: objectiveData?.title || 'Unknown',
      completed_by: taskData.assigned_to_name || 'Unknown',
      completed_at: taskData.completed_at
    });
    console.log('📡 Task completed event emitted globally');
  }
};

// Helper function to emit objective completion events  
export const emitObjectiveCompleted = async (objectiveData) => {
  const io = getSocketInstance();
  if (!io) return;

  console.log('🎉 Emitting objective_completed event:', objectiveData);
  
  // Convert group_id buffer to UUID string if needed
  const groupId = objectiveData.group_id ? 
    (Buffer.isBuffer(objectiveData.group_id) ? bufferToUuid(objectiveData.group_id) : objectiveData.group_id) : 
    null;

  console.log('🎉 Converted group_id for emission:', groupId);
  
  // Emit to the specific group if available
  if (groupId) {
    io.to(groupId).emit('objective_completed', {
      id: objectiveData.id,
      title: objectiveData.title,
      group_id: groupId,
      completed_at: new Date().toISOString()
    });
    console.log('🎉 Objective completed event emitted to group:', groupId);
  } else {
    // Fallback to global emit
    io.emit('objective_completed', {
      id: objectiveData.id,
      title: objectiveData.title,
      completed_at: new Date().toISOString()
    });
    console.log('🎉 Objective completed event emitted globally');
  }
};

// Helper function to emit progress updates
export const emitProgressUpdate = async (objectiveData, progressData) => {
  const io = getSocketInstance();
  if (!io) return;

  console.log('📊 Emitting progress_update event:', { objectiveData, progressData });
  
  // Convert group_id buffer to UUID string if needed
  const groupId = objectiveData.group_id ? 
    (Buffer.isBuffer(objectiveData.group_id) ? bufferToUuid(objectiveData.group_id) : objectiveData.group_id) : 
    null;

  console.log('📊 Converted group_id for emission:', groupId);
  
  // Emit to the specific group if available
  if (groupId) {
    io.to(groupId).emit('progress_update', {
      objective_id: objectiveData.id,
      objective_title: objectiveData.title,
      group_id: groupId,
      progress: progressData.progress,
      completed_tasks: progressData.completedTasks,
      total_tasks: progressData.totalTasks,
      is_completed: progressData.progress >= 100
    });
    console.log('📊 Progress update event emitted to group:', groupId);
  } else {
    // Fallback to global emit
    io.emit('progress_update', {
      objective_id: objectiveData.id,
      objective_title: objectiveData.title,
      progress: progressData.progress,
      completed_tasks: progressData.completedTasks,
      total_tasks: progressData.totalTasks,
      is_completed: progressData.progress >= 100
    });
    console.log('📊 Progress update event emitted globally');
  }
};
