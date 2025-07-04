import Bazarlist from "../models/bazarlist.model.js";
import dayjs from 'dayjs';

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
        const month = req.query.month || dayjs().format("YYYY-MM");
        const startOfMonth = dayjs(month).startOf('month').toDate();
        const endOfMonth = dayjs(month).endOf('month').toDate();

        const totalData = await Bazarlist.aggregate([
            {
                $match: {
                    date: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount" },
                    totalCount: { $sum: 1 }
                }
            }
        ]);

        const totalAmount = totalData[0]?.totalAmount || 0;
        const totalBazar = totalData[0]?.totalCount || 0;

        const bazarlist = await Bazarlist.find({
            date: { $gte: startOfMonth, $lte: endOfMonth }
        }).sort({ date: 1 });

        return res.status(200).json({ bazarlist, totalAmount, totalBazar });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Error fetching Bazarlist",
            error: error.message,
            stack: error.stack 
        });
    }
}


export { createBazarlist, getBazarlist };