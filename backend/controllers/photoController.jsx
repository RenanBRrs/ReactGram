const Photo = require('../models/Photo.jsx');
const User = require('../models/User.jsx');

const mongoose = require('mongoose');

// Insert a new photo, with an user related to it
const insertPhoto = async (req, res) => {
  const { title } = req.body;

  const image = req.file.filename;

  const reqUser = req.user;

  const user = await User.findById(reqUser._id);

  //   Create a new photo
  const newPhoto = await Photo.create({
    image,
    title,
    userId: user._id,
    UserName: user.name,
  });

  //   If photo was created successfully, return data
  if (!newPhoto) {
    res
      .status(422)
      .json({ errors: ["There's a problem, please try again later"] });
    return;
  }
  res.status(201).json(newPhoto);
};

// Remove the photo from DB
const deletePhoto = async (req, res) => {
  const { id } = req.params;

  const reqUser = req.user;

  const photo = await Photo.findById(id);

  // Check if photo exists
  if (!photo) {
    res.status(404).json({ errors: ['Photo not found!'] });
    return;
  }

  // Check if photo belongs to user
  if (!photo.userId.equals(reqUser._id)) {
    res.status(422).json({ errors: ["There's erro, try later again!"] });
    return;
  }

  await Photo.findByIdAndDelete(photo._id);

  res.status(200).json({ id: photo._id, message: 'Photo deleted sucess.' });
};

// Get all photos
const getAllPhotos = async (req, res) => {
  const photos = await Photo.find({})
    .sort([['created_at', -1]])
    .exec();

  return res.status(200).json(photos);
};

const getUserPhotos = async (req, res) => {
  const { id } = req.params;

  const photos = await Photo.find({ userId: id })
    .sort([['createdAt', -1]])
    .exec();

  return res.status(200).json(photos);
};

const getPhotoById = async (req, res) => {
  const { id } = req.params;

  const photo = await Photo.findById(id);

  // Check if the photo exists
  if (!photo) {
    res.status(404).json({ errors: ['Photo not found'] });
    return;
  }
  res.status(200).json(photo);
};

// Update a photo
const updatePhoto = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  const reqUser = req.user;

  const photo = await Photo.findById(id);

  // Check if photo exists
  if (!photo) {
    res.status(404).json({ errors: ['Photo not found'] });
    return;
  }

  // Check if photo belongs to user
  if (!photo.userId.equals(reqUser._id)) {
    res.status(422).json({ errors: ['Theres an error, please try later!'] });
    return;
  }

  if (title) {
    photo.title = title;
  }

  await photo.save();

  res.status(200).json({ photo, message: 'Photo changed successfully' });
};

// Like functionality
const likePhoto = async (req, res) => {
  const { id } = req.params;
  const reqUser = req.user;
  const photo = await Photo.findById(id);

  // Check if photo exists
  if (!photo) {
    res.status(404).json({ errors: ['Photo not found'] });
    return;
  }

  // Check if user already has liked this photo
  if (photo.likes.includes(reqUser._id)) {
    res.status(422).json({ errors: ['User already liked this photo'] });
    return;
  }

  // Put user id in likes array
  photo.likes.push(reqUser._id);

  photo.save();

  res.status(200).json({
    photoId: id,
    userId: reqUser._id,
    message: 'The photo has been liked.',
  });
};

// Comment functionality
const commnetPhoto = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  const reqUser = req.user;

  const user = await User.findById(reqUser._id);

  const photo = await Photo.findById(id);

  // Check if photo exists
  if (!photo) {
    res.status(404).json({ errors: ['Photo not found!'] });
    return;
  }

  // Put comment in the array of comments
  const userComment = {
    comment,
    userName: user.name,
    userImage: user.profileImage,
    userId: user._id,
  };

  photo.comments.push(userComment);

  await photo.save();

  res.status(200).json({
    comment: userComment,
    message: 'The comment was added successfully',
  });
};

// Search photos by title
const searchPhotos = async (req, res) => {
  const { q } = req.query;

  const photos = await Photo.find({ title: new RegExp(q, 'i') }).exec();

  res.status(200).json(photos);
};

module.exports = {
  insertPhoto,
  deletePhoto,
  getAllPhotos,
  getUserPhotos,
  getPhotoById,
  updatePhoto,
  likePhoto,
  commnetPhoto,
  searchPhotos,
};
