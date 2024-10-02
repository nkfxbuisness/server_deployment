const Variable = require("../models/variableModel");

const addVariable = async (req, res) => {
  const { key, value } = req.body;

  try {
    let existingVariable = await Variable.findOne({ key });
    if (existingVariable) {
      return res.json({ success: false, message: "Variable already exists!" });
    }

    const newVariable = new Variable({
      key,
      value,
    });

    await newVariable.save();
    return res
      .status(201)
      .json({
        success: true,
        message: "Variable stored successfully",
        variable: newVariable,
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getVariable = async (req, res) => {
  const {key} = req.params;

  try {
    const variable = await Variable.findOne({ key });
    if (!variable) {
      return res.json({ success: false, message: "Variable not found" });
    }
    return res
      .status(200)
      .json({
        success: true,
        message: `${key} got successfully`,
        data: variable.value,
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateVariable = async (req, res) => {
    const {key} = req.params;
    const { value } = req.body;
  
    try {
      const updatedVariable = await Variable.findOneAndUpdate(
        { key },
        { value },
        { new: true } // Return the updated document
      );
  
      if (!updatedVariable) {
        return res.json({success:false, message: "failed to update the variable" });
      }
  
      return res.status(200).json({success:true, message: "Variable updated", data: updatedVariable });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  };

  const deleteVariable = async (req, res) => {
    const {key} = req.params;
  
    try {
      const deletedVariable = await Variable.findOneAndDelete({ key });
      if (!deletedVariable) {
        return res.json({success:false, message: "Failed to delete !" });
      }
      return res.status(200).json({success:true, message: "Variable deleted", data: deletedVariable });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  };

module.exports = {
  addVariable,
  getVariable,
  updateVariable,
  deleteVariable
};
