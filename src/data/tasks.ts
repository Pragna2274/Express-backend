import { TaskStatus } from "../types/task";
import { TaskModel } from "../schemas/taskSchemas";
 
// GET all tasks
export const getTasks = async (userId: string, role: string) => {
  if (role === "admin") {
    return TaskModel.find();
  }
  return TaskModel.find({ userId });
};
 
// GET task by ID
export const getTaskById = async (
  taskId: string,
  userId: string,
  role: string
) => {
  if (role === "admin") {
    return TaskModel.findById(taskId);
  }
  return TaskModel.findOne({ _id: taskId, userId });
};
 
// CREATE task
export const createTask = async (
  userId: string,
  title: string,
  description: string,
  time: string
) => {
  return TaskModel.create({
    userId,
    title,
    description,
    time,
    duration: 0,
  });
};
 
// UPDATE task
export const updateTask = async (
  taskId: string,
  userId: string,
  role: string,
  updates: any
) => {
  if (role === "admin") {
    return TaskModel.findByIdAndUpdate(taskId, updates, { new: true });
  }
  return TaskModel.findOneAndUpdate(
    { _id: taskId, userId },
    updates,
    { new: true }
  );
};
 
// DELETE task
export const deleteTaskById = async (
  taskId: string,
  userId: string,
  role: string
) => {
  if (role === "admin") {
    return TaskModel.findByIdAndDelete(taskId);
  }
  return TaskModel.findOneAndDelete({ _id: taskId, userId });
};
 
// GET tasks by status
// GET tasks by status (RBAC-aware)
export const getTasksByStatus = async (
  status: TaskStatus,
  userId: string,
  role: string
) => {
  if (role === "admin") {
    return TaskModel.find({ status }).sort({ createdAt: -1 });
  }
 
  return TaskModel.find({
    status,
    userId,
  }).sort({ createdAt: -1 });
};