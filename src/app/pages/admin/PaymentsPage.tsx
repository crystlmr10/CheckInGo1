import { useState } from "react";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  MoreHorizontal, 
  Filter, 
  Download, 
  ExternalLink 
} from "lucide-react";

// Mock data
const PAYMENTS = [
  { id: "P-1001", guest: "Maria Santos", room: "Private Queen A", amount: 3500, date: "2024-02-28", status: "pending", proof: "https://via.placeholder.com/300x400" },
  { id: "P-1002", guest: "John Doe", room: "Dorm Bed 1", amount: 1200, date: "2024-02-27", status: "approved", proof: "https://via.placeholder.com/300x400" },
  { id: "P-1003", guest: "Sarah Lee", room: "Family Suite", amount: 4500, date: "2024-02-26", status: "rejected", proof: "https://via.placeholder.com/300x400" },
  { id: "P-1004", guest: "Mike Tan", room: "Private Queen B", amount: 1800, date: "2024-02-25", status: "approved", proof: "https://via.placeholder.com/300x400" },
  { id: "P-1005", guest: "Anna Cruz", room: "Dorm Bed 2", amount: 650, date: "2024-02-24", status: "pending", proof: "https://via.placeholder.com/300x400" },
];

export function PaymentsPage() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const filteredPayments = PAYMENTS.filter(payment => {
    const matchesStatus = filterStatus === "all" || payment.status === filterStatus;
    const matchesSearch = payment.guest.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payment Transactions</h1>
          <p className="text-gray-500 text-sm">Review and approve guest payments securely.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by guest name or ID..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {["all", "pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${filterStatus === status ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase font-medium">
              <th className="py-3 px-6">Transaction ID</th>
              <th className="py-3 px-6">Guest</th>
              <th className="py-3 px-6">Room</th>
              <th className="py-3 px-6">Date</th>
              <th className="py-3 px-6">Amount</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment) => (
              <tr key={payment.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                <td className="py-4 px-6 font-mono text-xs text-gray-500">#{payment.id}</td>
                <td className="py-4 px-6 font-medium text-gray-900">{payment.guest}</td>
                <td className="py-4 px-6 text-sm text-gray-500">{payment.room}</td>
                <td className="py-4 px-6 text-sm text-gray-500">{payment.date}</td>
                <td className="py-4 px-6 font-bold text-gray-900">₱{payment.amount.toLocaleString()}</td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                    payment.status === 'approved' ? 'bg-green-100 text-green-700' : 
                    payment.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {payment.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                    {payment.status === 'rejected' && <XCircle className="w-3 h-3" />}
                    {payment.status === 'pending' && <Clock className="w-3 h-3" />}
                    <span className="capitalize">{payment.status}</span>
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <button 
                    onClick={() => setSelectedPayment(payment)}
                    className="text-gray-400 hover:text-black p-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredPayments.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-200" />
            <p>No transactions found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col md:flex-row">
            <div className="md:w-1/2 bg-gray-100 p-8 flex items-center justify-center relative">
               <img src={selectedPayment.proof} alt="Proof of Payment" className="max-w-full max-h-64 object-contain shadow-lg rounded-lg" />
               <a href={selectedPayment.proof} target="_blank" rel="noreferrer" className="absolute bottom-4 right-4 bg-white/80 p-2 rounded-lg hover:bg-white text-gray-600 hover:text-black transition-colors">
                 <ExternalLink className="w-4 h-4" />
               </a>
            </div>
            
            <div className="md:w-1/2 p-8 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold">Payment Details</h2>
                  <p className="text-sm text-gray-500">Transaction #{selectedPayment.id}</p>
                </div>
                <button onClick={() => setSelectedPayment(null)} className="text-gray-400 hover:text-black">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 mb-8 flex-1">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Guest Name</span>
                  <span className="font-medium text-right">{selectedPayment.guest}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Room Type</span>
                  <span className="font-medium text-right">{selectedPayment.room}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Date</span>
                  <span className="font-medium text-right">{selectedPayment.date}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">Total Amount</span>
                  <span className="font-bold text-lg text-right">₱{selectedPayment.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500 text-sm">Current Status</span>
                  <span className={`capitalize font-bold ${
                    selectedPayment.status === 'approved' ? 'text-green-600' : 
                    selectedPayment.status === 'rejected' ? 'text-red-600' : 
                    'text-yellow-600'
                  }`}>{selectedPayment.status}</span>
                </div>
              </div>

              {selectedPayment.status === 'pending' && (
                <div className="grid grid-cols-2 gap-4 mt-auto">
                  <button className="flex items-center justify-center gap-2 bg-red-50 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition-colors">
                    <XCircle className="w-5 h-5" /> Reject
                  </button>
                  <button className="flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition-colors shadow-lg shadow-green-200">
                    <CheckCircle className="w-5 h-5" /> Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
