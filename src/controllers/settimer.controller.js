import { Timer } from "../models/settimer.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import dayjs from "dayjs";

const createTimer = asyncHandler(async (req, res) => {
    let { start, end } = req.body;
    const userId = req.user._id;
    start = "00:00";

    // Validate input format (if model validation fails, it will throw, but adding here for clear frontend errors)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!timeRegex.test(start) || !timeRegex.test(end)) {
        throw new ApiError(400, "Start and End must be in HH:mm format, e.g., '08:00' or '22:00'.");
    }

    // Optional: Convert to minutes for validation comparison
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);

    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;

    if (endTotal <= startTotal) {
        throw new ApiError(400, "End time must be after start time.");
    }

    let timer = await Timer.findOne({ user: userId });

    if (timer) {
        timer.start = start;
        timer.end = end;
        await timer.save();
        return res.status(200).json(new ApiResponse(200, timer, "Timer updated successfully ✅"));
    } else {
        timer = await Timer.create({
            user: userId,
            start,
            end
        });
        return res.status(201).json(new ApiResponse(201, timer, "Timer created successfully ✅"));
    }
});




// Helper: decide applied day based on cutoff hour (8 PM)
function getAppliedDay(createdAt) {
  const createdTime = dayjs(createdAt);
  const cutoffHour = 20; // 8 PM cutoff

  if (createdTime.hour() >= cutoffHour) {
    // Created at or after 8 PM → timer applies next day
    return createdTime.add(1, "day").format("YYYY-MM-DD");
  } else {
    // Created before 8 PM → timer applies same day
    return createdTime.format("YYYY-MM-DD");
  }
}

const getTimeDifference = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const timer = await Timer.findById(id);

  if (!timer) {
    return res.status(404).json({
      success: false,
      message: "Timer not found 🥲",
    });
  }

  // Calculate applied day using cutoff logic
  const appliedDay = getAppliedDay(timer.createdAt);

  // Build start and end times for applied day
  const startTime = dayjs(`${appliedDay}T00:00`);
  const endTime = dayjs(`${appliedDay}T${timer.end}`);

  // Calculate difference in minutes
  let diffInMinutes = endTime.diff(startTime, "minute");

  // If difference is negative (should not be, but just in case), fix by adding 24h
  if (diffInMinutes < 0) {
    diffInMinutes += 24 * 60;
  }

  const hours = Math.floor(diffInMinutes / 60);
  const minutes = diffInMinutes % 60;

  return res.status(200).json({
    success: true,
    data: {
      timerId: timer._id,
      start: "00:00",
      end: timer.end,
      hours,
      minutes,
      appliedDay,
    },
    message: `Timer difference: ${hours} hours and ${minutes} minutes ✅`,
  });
});


export {
    createTimer,
    getTimeDifference

}