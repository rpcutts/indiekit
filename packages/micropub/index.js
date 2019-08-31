module.exports = {
  middleware: {
    media: require('./lib/media/middleware'),
    post: require('./lib/middleware')
  },
  media: {
    queryEndpoint: require('./lib/media/query-endpoint'),
    uploadMedia: require('./lib/media/upload-media')
  },
  action: require('./lib/action'),
  createPost: require('./lib/create-post'),
  deletePost: require('./lib/delete-post'),
  queryEndpoint: require('./lib/query-endpoint'),
  uploadAttachments: require('./lib/upload-attachments'),
  undeletePost: require('./lib/undelete-post'),
  updatePost: require('./lib/update-post')
};
