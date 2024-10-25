const Project = require("../models/Project.js");
const User = require("../models/User.js");

const ProjectAdd = async (req, res) => {
  try {
    const newProject = new Project(req.body);
    await newProject.save();
    res.status(201).json({ success: true, data: newProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const ProjectsGet = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, name } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (name) filter.name = { $regex: name, $options: "i" }; // Case-insensitive name search

    // Calculate the skip value for pagination
    const skip = (page - 1) * limit;

    // Fetch filtered and paginated projects
    const projects = await Project.find(filter).skip(skip).limit(Number(limit));
    if (!projects) {
      return res
        .status(404)
        .json({ success: false, message: "projects data not found!" });
    }
    const total = await Project.countDocuments(filter);

    // Respond with paginated and filtered data
    return res.status(200).json({
      success: true,
      count: projects.length,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: projects,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const ProjectGet = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const ProjectUpdate = async (req, res) => {
  try {
    const { name, description, dueDate, status } = req.body;

    // Find the project by its ID
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    project.name = name || project.name;
    project.description = description || project.description;
    project.dueDate = dueDate || project.dueDate;
    project.status = status || project.status;

    // Save the updated project
    await project.save();

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const ProjectDelete = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    res.status(200).json({
      success: true,
      message: "Project removed",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  ProjectAdd,
  ProjectsGet,
  ProjectDelete,
  ProjectUpdate,
  ProjectGet,
};
