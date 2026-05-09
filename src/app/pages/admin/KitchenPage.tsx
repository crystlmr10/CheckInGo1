import { useState } from "react";
import { 
  CheckCircle, 
  Clock, 
  Utensils, 
  Coffee, 
  Check, 
  Trash2,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";

const ORDERS = [
  { id: 1, guest: "Maria Santos", room: "Room 101", items: [{ name: "Filipino Breakfast", qty: 2, notes: "No garlic rice" }], time: "07:30 AM", status: "pending" },
  { id: 2, guest: "John Doe", room: "Dorm Bed 3", items: [{ name: "Pancakes", qty: 1, notes: "Extra syrup" }, { name: "Coffee", qty: 1 }], time: "08:00 AM", status: "preparing" },
  { id: 3, guest: "Sarah Lee", room: "Family Suite", items: [{ name: "Continental Breakfast", qty: 4 }], time: "08:30 AM", status: "ready" },
];

export function KitchenPage() {
  const [orders, setOrders] = useState(ORDERS);

  const updateStatus = (id: number, status: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kitchen Orders</h1>
          <p className="text-gray-500 text-sm">Manage breakfast preparations efficiently.</p>
        </div>
        <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-200 text-yellow-800 text-xs font-bold">
          <AlertCircle className="w-4 h-4" />
          <span>3 Orders Pending for Today</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pending Column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-gray-500 uppercase text-xs tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4" /> Pending
            </h2>
            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{orders.filter(o => o.status === 'pending').length}</span>
          </div>
          
          {orders.filter(o => o.status === 'pending').map(order => (
            <OrderCard key={order.id} order={order} onUpdate={updateStatus} />
          ))}
        </div>

        {/* Preparing Column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-orange-500 uppercase text-xs tracking-wider flex items-center gap-2">
              <Utensils className="w-4 h-4" /> Preparing
            </h2>
            <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">{orders.filter(o => o.status === 'preparing').length}</span>
          </div>
          
          {orders.filter(o => o.status === 'preparing').map(order => (
            <OrderCard key={order.id} order={order} onUpdate={updateStatus} />
          ))}
        </div>

        {/* Ready Column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-green-600 uppercase text-xs tracking-wider flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Ready to Serve
            </h2>
            <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-0.5 rounded-full">{orders.filter(o => o.status === 'ready').length}</span>
          </div>
          
          {orders.filter(o => o.status === 'ready').map(order => (
            <OrderCard key={order.id} order={order} onUpdate={updateStatus} />
          ))}
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order, onUpdate }: any) {
  const statusColors = {
    pending: "border-l-4 border-gray-400",
    preparing: "border-l-4 border-orange-400 bg-orange-50/30",
    ready: "border-l-4 border-green-500 bg-green-50/30 opacity-75"
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all hover:shadow-md ${statusColors[order.status as keyof typeof statusColors]}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-gray-900">{order.guest}</h3>
          <p className="text-xs text-gray-500">{order.room}</p>
        </div>
        <div className="text-right">
          <span className="block font-mono font-bold text-lg text-gray-800">{order.time}</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {order.items.map((item: any, i: number) => (
          <div key={i} className="flex justify-between text-sm items-start">
            <div className="flex gap-2">
              <span className="font-bold text-gray-700">{item.qty}x</span>
              <span className="text-gray-800">{item.name}</span>
            </div>
            {item.notes && <span className="text-xs text-red-500 italic max-w-[100px] text-right">{item.notes}</span>}
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-3 border-t border-gray-100">
        {order.status === 'pending' && (
          <button 
            onClick={() => onUpdate(order.id, 'preparing')}
            className="flex-1 bg-black text-white text-xs font-bold py-2 rounded-lg hover:bg-orange-500 transition-colors flex items-center justify-center gap-1"
          >
            Start Prep <Utensils className="w-3 h-3" />
          </button>
        )}
        
        {order.status === 'preparing' && (
          <button 
            onClick={() => onUpdate(order.id, 'ready')}
            className="flex-1 bg-orange-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
          >
            Mark Ready <Check className="w-3 h-3" />
          </button>
        )}

        {order.status === 'ready' && (
          <button 
            onClick={() => onUpdate(order.id, 'served')}
            className="flex-1 bg-green-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
          >
            Served <CheckCircle className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
