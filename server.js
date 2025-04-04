const express = require("express");
const app = express();
const PORT = 3000;

const prisma = require("./prisma");

app.use(express.json());
app.use(require("morgan")("dev"));

//GET returns an array of customers
app.get("/api/customers", async (req, res, next) => {
  try {
    const customers = await prisma.customer.findMany();
    res.json(customers);
  } catch (err) {
    next();
  }
});

//GET returns an array of restaurants
app.get("/api/restaurants", async (req, res, next) => {
  try {
    const restaurants = await prisma.restaurant.findMany();
    res.json(restaurants);
  } catch (err) {
    next();
  }
});

//REturns an array of reservations
app.get("/api/reservations", async (req, res, next) => {
  try {
    const reservations = await prisma.reservation.findMany();
    res.json(reservations);
  } catch (error) {
    next();
  }
});

//POST  has an object containing a valid restaurantId, date, and partyCount as the payload, and returns the created reservation with a status code of 201
app.post("/api/customers/:id/reservations", async (req, res, next) => {
  try {
    const customerId = +req.params.id;
    const { restaurantId, date, partyCount } = req.body;
    const reservation = await prisma.reservation.create({
      data: {
        customerId,
        restaurantId,
        date,
        partyCount,
      },
    });
    res.status(201).json(reservation);
  } catch (err) {
    next();
  }
});

//DELETE to delete in the URL, gets passed the id of the reservation to delete and the customerId, and returns nothing with a status code of 204
app.delete(
    "/api/customers/:customerId/reservations/:id",
    async (req, res, next) => {
      try {
        const id = +req.params.id;
        const customerId = +req.params.customerId;
  
        const reservationExists = await prisma.reservation.findFirst({
          where: { id, customerId },
        });
  
        if (!reservationExists) {
          return next({
            status: 404,
            message: `Could not find reservation with id ${id} for customer ${customerId}.`,
          });
        }
        await prisma.reservation.delete({ where: { id, customerId } });
        res.sendStatus(204);
      } catch (err) {
        next();
      }
    }
  );

// Simple error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status ?? 500;
  const message = err.message ?? "Internal server error.";
  res.status(status).json({ message });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
