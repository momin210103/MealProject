import Bazarlist from "../models/bazarlist.model.js";
const createBazarlist = async (req, res) => {
    const { date, name, description, amount } = req.body;
    if (!date || !name || !description || !amount) {
        return res.status(400).json({ message: "Date, name, description, and amount are required" });
    }

    try {
        const newBazarlist = new Bazarlist({ date, name, description, amount });
        await newBazarlist.save();
        return res.status(201).json(newBazarlist);
    } catch (error) {
        return res.status(500).json({ message: "Error creating Bazarlist", error });
    }
}

const getBazarlist = async (req, res) => {
    try {
        const bazarlist = await Bazarlist.find();
        return res.status(200).json(bazarlist);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching Bazarlist", error });
    }
}

export { createBazarlist, getBazarlist };