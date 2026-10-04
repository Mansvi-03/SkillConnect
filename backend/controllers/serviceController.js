const Service = require("../models/Service");
const ServiceProvider = require("../models/ServiceProvider");
const Category = require("../models/Category");

// =========================================================
// CREATE SERVICE
// =========================================================

const createService = async (req, res) => {
  try {
    const { category, name, description, price, location } = req.body;

    if (
      !category ||
      !name ||
      !description ||
      price === undefined ||
      !location
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const provider = await ServiceProvider.findOne({
      user: req.user._id,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Service provider profile not found",
      });
    }

    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const images = req.files
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];

    const service = await Service.create({
      provider: provider._id,
      category,
      name,
      description,
      price,
      location,
      images,
    });

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================================
// GET ALL SERVICES WITH SEARCH & FILTER
// =========================================================

const getServices = async (req, res) => {
  try {
    const { search, category, location, minPrice, maxPrice, minRating } =
      req.query;

    const filter = {
      isActive: true,
    };

    // Search by service name or description
    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by location
    if (location) {
      filter.location = {
        $regex: location,
        $options: "i",
      };
    }

    // Filter by price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};

      if (minPrice !== undefined) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice !== undefined) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // Filter by minimum rating
    if (minRating !== undefined) {
      filter.averageRating = {
        $gte: Number(minRating),
      };
    }

    const services = await Service.find(filter)
      .populate({
        path: "provider",
        populate: {
          path: "user",
          select: "name email phone",
        },
      })
      .populate("category");

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================================
// GET PROVIDER'S OWN SERVICES
// =========================================================

const getMyServices = async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({
      user: req.user._id,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Service provider profile not found",
      });
    }

    const services = await Service.find({
      provider: provider._id,
    })
      .populate({
        path: "provider",
        populate: {
          path: "user",
          select: "name email phone",
        },
      })
      .populate("category")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================================
// GET SINGLE SERVICE
// =========================================================

const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate({
        path: "provider",
        populate: {
          path: "user",
          select: "name email phone",
        },
      })
      .populate({
        path: "category",
        select: "name description",
      });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================================
// UPDATE SERVICE
// =========================================================

const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const provider = await ServiceProvider.findOne({
      user: req.user._id,
    });

    if (!provider || service.provider.toString() !== provider._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own services",
      });
    }

    const { category, name, description, price, location, isActive } = req.body;

    if (category) {
      const categoryExists = await Category.findById(category);

      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      service.category = category;
    }

    if (name !== undefined) {
      service.name = name;
    }

    if (description !== undefined) {
      service.description = description;
    }

    if (price !== undefined) {
      service.price = price;
    }

    if (location !== undefined) {
      service.location = location;
    }

    if (isActive !== undefined) {
      service.isActive = isActive;
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/${file.filename}`);

      service.images = [...service.images, ...newImages];
    }

    await service.save();

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================================
// DELETE SERVICE
// =========================================================

const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const provider = await ServiceProvider.findOne({
      user: req.user._id,
    });

    const isOwner =
      provider && service.provider.toString() === provider._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this service",
      });
    }

    await service.deleteOne();

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================================
// GET SERVICES BY CATEGORY
// =========================================================

const getServicesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const categoryExists = await Category.findById(categoryId);

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const services = await Service.find({
      category: categoryId,
      isActive: true,
    })
      .populate({
        path: "provider",
        populate: {
          path: "user",
          select: "name email phone",
        },
      })
      .populate("category");

    res.status(200).json({
      success: true,
      count: services.length,
      category: categoryExists,
      services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  createService,
  getServices,
  getMyServices,
  getServiceById,
  getServicesByCategory,
  updateService,
  deleteService,
};
