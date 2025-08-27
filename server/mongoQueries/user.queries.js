export const userQueries = {
  findByEmail: (email) => ({ email }),

  findById: (id) => ({ _id: id }),

  updatePassword: (userId, newPasswordHash) => ({
    filter: { _id: userId },
    update: { $set: { password: newPasswordHash } }
  })
};