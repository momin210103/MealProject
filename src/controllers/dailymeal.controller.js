import { UserMealSelection } from "../models/usermealselection.model.js";

export const saveMealSelection = async (req, res) => {
  const { breakfast, lunch, dinner } = req.body.selection;
  const selectionDate = new Date(req.body.date);
  console.log(req.body.selection);

  try {
    const result = await UserMealSelection.findOneAndUpdate(
      { userId: req.user.id, date: selectionDate },
      { selection: { breakfast: (breakfast ?? false), lunch:(lunch ?? false), dinner:(dinner ?? false) } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    

    res.status(200).json({ message: "✅ Meal selection saved", data: result });
  } catch (err) {
    res.status(500).json({ message: "❌ Failed to save selection", error: err.message });
  }
};
export const getMealSelection = async (req, res) => {
  try {
    const meals = await UserMealSelection.find({ userId: req.user.id });
    res.status(200).json(meals);
  } catch (err) {
    res.status(500).json({ message: "❌ Failed to fetch meal selections", error: err.message });
  }
};
