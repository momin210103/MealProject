import Bazarlist from "../models/bazarlist.model.js";
import dayjs from "dayjs";

// This function fetches totalAmount & totalCount reusable anywhere
export const getBazarlistSummary = async (month) => {
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

    return { totalAmount, totalBazar };
};
