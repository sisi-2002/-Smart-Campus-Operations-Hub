// Mock data for testing when backend is not ready
const mockBookings = [];

// Generate mock time slots
const generateMockTimeSlots = () => {
  const slots = [];
  const today = new Date();
  today.setHours(9, 0, 0, 0);
  
  for (let i = 0; i < 8; i++) {
    const start = new Date(today);
    start.setHours(9 + i, 0, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 1, 0, 0, 0);
    slots.push([start.toISOString(), end.toISOString()]);
  }
  return slots;
};

export const mockBookingApi = {
  createBooking: (data) => {
    const resource = mockResources.find(r => r.id === data.resourceId);
    const newBooking = {
      id: Date.now().toString(),
      ...data,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      resourceName: resource?.name,
      resourceType: resource?.type,
      userName: 'Current User',
      userEmail: 'user@example.com'
    };
    mockBookings.push(newBooking);
    return Promise.resolve({ data: newBooking });
  },
  getMyBookings: () => Promise.resolve({ data: mockBookings }),
  getAvailableTimeSlots: () => Promise.resolve({ data: generateMockTimeSlots() }),
  approveBooking: (id, approved, reason) => {
    const booking = mockBookings.find(b => b.id === id);
    if (booking) {
      booking.status = approved ? 'APPROVED' : 'REJECTED';
      if (reason) booking.rejectionReason = reason;
    }
    return Promise.resolve({ data: booking });
  },
  cancelBooking: (id, reason) => {
    const booking = mockBookings.find(b => b.id === id);
    if (booking) {
      booking.status = 'CANCELLED';
      booking.cancellationReason = reason;
    }
    return Promise.resolve({ data: booking });
  }
};