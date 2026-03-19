import User from '../models/user.model.js';

export const createUser = async (userData) => {
    const user = new User(userData);
    return await user.save();
};

export const getUserByEmail = async (email) => {
    return await User.findOne({ email });
};

export const getUserById = async (id) => {
    return await User.findById(id);
};

export const updateUser = async (id, updateData) => {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
};