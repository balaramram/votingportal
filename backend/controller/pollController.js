import { VotingModel } from "../models/VotingModel.js";
import { AppError } from "../middleware/log-error-handler/logemodule.js";
import mongoose from "mongoose";

// Create voting poll function
export const createPoll = async (req, res, next) => {
  const { title, options, department, endDate } = req.body;
  try {
    // Check if admin has permission for this department
    if (department !== "all" && !req.admin.department.includes(department)) {
      return next(
        new AppError("Unauthorized to create poll for this department", 403)
      );
    }

    const newPoll = new VotingModel({
      title,
      options,
      department,
      createdBy: req.admin.id, // Assuming admin is authenticated
      endDate,
    });
    await newPoll.save();
    res.status(201).json({
      success: true,
      message: "Poll created successfully",
      poll: newPoll,
    });
  } catch (error) {
    return next(new AppError("Error creating poll", 500));
  }
};

// Get all polls for a department
export const getPolls = async (req, res, next) => {
  try {
    const { department } = req.query;
    const polls = await VotingModel.find({
      $or: [{ department }, { department: "all" }],
      isActive: true,
    });
    res.status(200).json({ success: true, polls });
  } catch (error) {
    return next(new AppError("Error fetching polls", 500));
  }
};

// Vote on a poll
export const votePoll = async (req, res, next) => {
  const { pollId, option } = req.body;
  try {
    const poll = await VotingModel.findById(pollId);
    if (!poll || !poll.isActive) {
      return next(new AppError("Poll not found or inactive", 404));
    }

    // Check if user can vote on this poll
    if (poll.department !== "all" && poll.department !== req.user.department) {
      return next(new AppError("Unauthorized to vote on this poll", 403));
    }

    // Check if user already voted
    const existingVote = poll.votes.find(
      (vote) => vote.userId.toString() === req.user.id
    );
    if (existingVote) {
      return next(new AppError("User already voted", 400));
    }

    poll.votes.push({ userId: req.user.id, option });
    await poll.save();
    res.status(200).json({ success: true, message: "Vote cast successfully" });
  } catch (error) {
    return next(new AppError("Error casting vote", 500));
  }
};

// Get poll results
export const getPollResults = async (req, res, next) => {
  const { pollId } = req.params;
  try {
    const poll = await VotingModel.findById(pollId).populate(
      "votes.userId",
      "name"
    );
    if (!poll) {
      return next(new AppError("Poll not found", 404));
    }

    const results = poll.options.map((opt) => ({
      option: opt,
      votes: poll.votes.filter((vote) => vote.option === opt).length,
    }));

    res.status(200).json({ success: true, poll, results });
  } catch (error) {
    return next(new AppError("Error fetching results", 500));
  }
};

// Delete a poll (Add this to your controller file)
export const deletePoll = async (req, res, next) => {
  const { pollId } = req.params; // Frontend-la irundhu vara ID
  try {
    const poll = await VotingModel.findByIdAndDelete(pollId);

    if (!poll) {
      return next(new AppError("Poll not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Poll deleted successfully",
    });
  } catch (error) {
    return next(new AppError("Error deleting poll", 500));
  }
};