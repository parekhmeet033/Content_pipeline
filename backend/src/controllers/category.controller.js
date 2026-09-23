const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/ApiResponse');

const listCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.contentCategory.findMany({
    where: { userId: req.user.id },
    include: { _count: { select: { contents: true } } },
    orderBy: { name: 'asc' },
  });
  sendSuccess(res, 200, { categories });
});

const getCategory = asyncHandler(async (req, res) => {
  const category = await prisma.contentCategory.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: { _count: { select: { contents: true } } },
  });
  if (!category) throw new ApiError(404, 'Category not found');
  sendSuccess(res, 200, { category });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await prisma.contentCategory.create({
    data: { ...req.body, userId: req.user.id },
  });
  sendSuccess(res, 201, { category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const existing = await prisma.contentCategory.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!existing) throw new ApiError(404, 'Category not found');

  const category = await prisma.contentCategory.update({
    where: { id: req.params.id },
    data: req.body,
  });
  sendSuccess(res, 200, { category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const existing = await prisma.contentCategory.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!existing) throw new ApiError(404, 'Category not found');

  await prisma.contentCategory.delete({ where: { id: req.params.id } });
  sendSuccess(res, 200, { deleted: true });
});

module.exports = { listCategories, getCategory, createCategory, updateCategory, deleteCategory };
