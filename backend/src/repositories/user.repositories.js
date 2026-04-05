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

export const verifyRefreshToken = async (userId, refreshToken) => {
    const user = await User.findById(userId);
    return user && user.refreshToken === refreshToken;
};

export const clearRefreshToken = async (id) => {
    return await User.findByIdAndUpdate(id, { refreshToken: null }, { new: true });
}

export const searchUsersForDirectChat = async (currentUserId, searchTerm, limit = 20) => {
    const trimmedSearch = String(searchTerm || "").trim();

    if (!trimmedSearch) {
        return [];
    }

    const searchRegex = new RegExp(trimmedSearch, "i");

    return await User.find({
        _id: { $ne: currentUserId },
        $or: [
            { fullname: searchRegex },
            { email: searchRegex },
        ],
    })
        .select("fullname email profilepic")
        .limit(limit);
};