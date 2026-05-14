import React, { useState } from 'react';
import { FiUsers, FiUserPlus, FiUserCheck, FiUserX } from 'react-icons/fi';
import { toast } from 'react-toastify';

const PassengerList = ({ bus, currentStopIndex, routeStops }) => {
  const [passengers, setPassengers] = useState([
    { id: 'STU001', name: 'Amit Sharma', status: 'boarded', seat: 12 },
    { id: 'STU002', name: 'Priya Singh', status: 'boarded', seat: 8 },
    { id: 'STU003', name: 'Rahul Kumar', status: 'boarded', seat: 23 },
    { id: 'STU004', name: 'Sneha Gupta', status: 'waiting', seat: null }
  ]);
  const [currentAction, setCurrentAction] = useState('none'); // none, boarding, alighting

  const totalCapacity = bus?.capacity || 50;
  const currentPassengers = passengers.filter(p => p.status === 'boarded').length;

  const handleBoardPassenger = (passengerId) => {
    setPassengers(prev => prev.map(p => 
      p.id === passengerId 
        ? { ...p, status: 'boarded', seat: Math.floor(Math.random() * totalCapacity) + 1 }
        : p
    ));
    toast.success('✅ Passenger boarded');
  };

  const handleAlightPassenger = (passengerId) => {
    setPassengers(prev => prev.map(p => 
      p.id === passengerId ? { ...p, status: 'alighted' } : p
    ));
    toast.success('👋 Passenger alighted');
  };

  const PassengerRow = ({ passenger }) => (
    <div className={`flex items-center justify-between p-4 rounded-xl transition-all ${
      passenger.status === 'boarded' 
        ? 'bg-emerald-50 border-2 border-emerald-200 hover:bg-emerald-100' 
        : passenger.status === 'alighted'
        ? 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
        : 'bg-blue-50 border-2 border-blue-200 hover:bg-blue-100'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm ${
          passenger.status === 'boarded' 
            ? 'bg-emerald-500 text-white' 
            : passenger.status === 'alighted'
            ? 'bg-gray-400 text-white'
            : 'bg-blue-500 text-white'
        }`}>
          {passenger.id.slice(-3)}
        </div>
        <div>
          <div className="font-semibold text-gray-900">{passenger.name}</div>
          <div className="text-sm text-gray-600">{passenger.id}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {passenger.status === 'boarded' && passenger.seat && (
          <span className="px-3 py-1 bg-white text-xs font-bold rounded-full shadow-sm">
            Seat {passenger.seat}
          </span>
        )}
        
        {passenger.status === 'waiting' && (
          <button
            className="btn btn-primary btn-sm p-2 px-4"
            onClick={() => handleBoardPassenger(passenger.id)}
          >
            <FiUserPlus className="w-4 h-4 mr-1" />
            Board
          </button>
        )}
        
        {passenger.status === 'boarded' && (
          <button
            className="btn bg-white border text-red-600 hover:bg-red-50 btn-sm p-2 px-4"
            onClick={() => handleAlightPassenger(passenger.id)}
          >
            <FiUserX className="w-4 h-4 mr-1" />
            Alight
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="card p-8 h-full flex flex-col">
      <div className="card-header mb-8">
        <h2 className="card-title flex items-center gap-3">
          <FiUsers className="w-7 h-7" />
          Passenger List
        </h2>
        <div className="flex items-center gap-4 text-sm">
          <span className="font-bold text-2xl text-blue-600">
            {currentPassengers}/{totalCapacity}
          </span>
          <div className="w-20 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all"
              style={{ width: `${(currentPassengers / totalCapacity) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar mb-8">
        {passengers.map((passenger) => (
          <PassengerRow key={passenger.id} passenger={passenger} />
        ))}
        
        {passengers.length === 0 && (
          <div className="text-center py-12">
            <FiUsers className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-500 mb-2">No Passengers</h3>
            <p className="text-gray-400 mb-6">Passengers will appear here during the trip</p>
          </div>
        )}
      </div>

      {/* Stop Info */}
      <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl border-2 border-dashed border-indigo-200 mt-auto">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-3 h-3 bg-indigo-500 rounded-full" />
          <h4 className="font-bold text-xl text-indigo-900">Current Stop</h4>
        </div>
        <div className="text-center">
          <div className="text-3xl font-black text-gray-900 mb-2">
            {routeStops[currentStopIndex]?.name || 'No Route Assigned'}
          </div>
          <div className="text-lg text-indigo-700 font-semibold mb-4">
            Expected: {currentPassengers} passengers
          </div>
          <div className="flex gap-3 justify-center">
            <button className="btn btn-primary px-8 py-3 text-sm">
              <FiUserCheck className="w-4 h-4 mr-1" />
              All Boarded
            </button>
            <button className="btn bg-white border text-indigo-600 hover:bg-indigo-50 px-8 py-3 text-sm">
              <FiUserPlus className="w-4 h-4 mr-1" />
              Add Passenger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerList;