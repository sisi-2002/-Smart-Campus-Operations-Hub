// Mock data for testing when backend is not ready
const mockResources = [
  {
    id: '1',
    name: 'Main Lecture Hall',
    type: 'LECTURE_HALL',
    capacity: 200,
    location: 'Block A, Floor 2',
    building: 'Main Building',
    status: 'ACTIVE',
    features: ['Projector', 'AC', 'Sound System', 'Smart Board'],
    availableFrom: '08:00',
    availableTo: '20:00'
  },
  {
    id: '2',
    name: 'Computer Lab 101',
    type: 'LAB',
    capacity: 50,
    location: 'Block B, Floor 1',
    building: 'Science Building',
    status: 'ACTIVE',
    features: ['Computers (50)', 'Projector', 'Whiteboard', 'AC'],
    availableFrom: '08:00',
    availableTo: '20:00'
  },
  {
    id: '3',
    name: 'Meeting Room A',
    type: 'MEETING_ROOM',
    capacity: 15,
    location: 'Block C, Floor 3',
    building: 'Admin Building',
    status: 'ACTIVE',
    features: ['TV Screen', 'Whiteboard', 'Conference Phone', 'AC'],
    availableFrom: '08:00',
    availableTo: '18:00'
  },
  {
    id: '4',
    name: 'Design Studio',
    type: 'STUDIO',
    capacity: 30,
    location: 'Block D, Floor 2',
    building: 'Creative Arts Building',
    status: 'ACTIVE',
    features: ['Drawing Tables', 'Projector', 'Natural Light', 'AC'],
    availableFrom: '09:00',
    availableTo: '19:00'
  },
  {
    id: '5',
    name: 'Conference Room',
    type: 'CONFERENCE',
    capacity: 100,
    location: 'Block A, Floor 1',
    building: 'Main Building',
    status: 'ACTIVE',
    features: ['Large Screen', 'Video Conference', 'Microphones', 'Catering Area'],
    availableFrom: '08:00',
    availableTo: '22:00'
  }
];

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

export const mockResourceApi = {
  getAllResources: () => Promise.resolve({ data: mockResources }),
  getResourceById: (id) => Promise.resolve({ data: mockResources.find(r => r.id === id) }),
  getResourcesByType: (type) => Promise.resolve({ data: mockResources.filter(r => r.type === type) }),
  getAvailableResources: () => Promise.resolve({ data: mockResources.filter(r => r.status === 'ACTIVE') }),
  searchResources: (query) => Promise.resolve({ 
    data: mockResources.filter(r => 
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.type.toLowerCase().includes(query.toLowerCase())
    ) 
  }),
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