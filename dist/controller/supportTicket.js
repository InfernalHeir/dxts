"use strict";

var models = require("../models");
const supportTicketModel = models.support_Ticket;

const addsupportTicket = async (req, res) => {
  console.log("-----inside add tickett---");
  console.log("req", req);
  var uuid = req.uuid;
  const { subject, description } = req.body;

  if (!subject || subject.length <= 0, !description || description.length <= 0) return res.status(500).json({
    status: false,
    message: "Please provide a valid firstName"
  });

  await supportTicketModel.create({
    userId: req.uuid,
    subject: subject,
    description: description,
    STATUS: 1,
    admin_reply: "",
    review: ""
  });

  return res.json({
    status: true,
    message: "Ticket created "
  });
};

const listAllTicketSupport = async (req, res) => {
  var ticketInfo = await supportTicketModel.findAll({
    // where: {
    //     STATUS: true,
    // }
  });
  return res.json({
    status: true,
    message: "Ticket list ",
    data: ticketInfo
  });
};

const resolveTicket = async (req, res) => {
  let { ticketId, reply } = req.body;
  if (!ticketId || !reply || reply.length <= 0 || ticketId.length <= 0) {
    res.json({
      status: false,
      message: "please provide ticketId"
    });
  }

  var ticketResolved = await supportTicketModel.update({
    admin_reply: reply,
    STATUS: false
  }, { where: { id: req.body.ticketId } });
  return res.json({
    status: true,
    message: "Ticket resolved "
  });
};

const userAllTickets = async (req, res) => {
  if (req.query.length <= 0) {
    req.uuid = req.query.uuid;
  }

  var userTicketList = await supportTicketModel.findAll({
    where: {
      userId: req.uuid
    }
  });

  return res.json({
    status: true,
    message: "Ticket list ",
    data: {
      tickets: userTicketList
    }
  });
};

module.exports = {
  addsupportTicket,
  listAllTicketSupport,
  userAllTickets,
  resolveTicket
};