import { DeleteOrderDialog } from '@/components/DeleteOrderDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  findOrderBySku,
  getAllOrders,
  updateOrderStatus,
} from '@/lib/services';
import { IOrders } from '@/types/types';
import { Filter, Loader2, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';

const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [orders, setOrders] = useState<IOrders[]>([]);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState<string | null>(null);
  const [prev, setPrev] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // loading global fetch
  const [isFetching, setIsFetching] = useState(false);

  // loading par order
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const pageSize = 10;
  const totalPages = Math.ceil(count / pageSize);

  const fetchOrders = async (pageNumber = 1) => {
    setIsFetching(true);

    try {
      const res = await getAllOrders(pageNumber, statusFilter);

      setOrders(res.results);
      setCount(res.count);
      setNext(res.next);
      setPrev(res.previous);
      setPage(pageNumber);
    } catch (err) {
      console.error('Error fetching orders:', err);
      toast.error('Failed to fetch orders');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  // search debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      async function handleFindOrder(pageNumber = 1) {
        try {
          setIsFetching(true);

          const res = await findOrderBySku(
            pageNumber,
            searchTerm
          );

          setOrders(res.results);
          setCount(res.count);
          setPage(pageNumber);
        } catch (err) {
          console.error('Error getting orders', err);
          toast.error('Failed to search orders');
        } finally {
          setIsFetching(false);
        }
      }

      if (searchTerm.trim()) {
        handleFindOrder();
      } else {
        fetchOrders();
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  function frontendUpdateOrderStatus(
    id: number,
    updatedOrder: IOrders
  ) {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? updatedOrder : order
      )
    );
  }

  function frontendEndDeleteOrder(id: number) {
    setOrders((prevOrders) =>
      prevOrders.filter((order) => order.id !== id)
    );
  }

  async function handleUpdateOrderStatus(
    orderId: number,
    status: string
  ) {
    setUpdatingOrderId(orderId);

    try {
      const response = await updateOrderStatus(orderId, {
        status,
      });

      frontendUpdateOrderStatus(orderId, response);

      toast.success('Order status updated successfully!');
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Failed to update order');
      }
    } finally {
      setUpdatingOrderId(null);
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }
    );
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'default';
      case 'shipped':
      case 'processing':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <>
      <Helmet>
        <title>Orders</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Orders
            </h1>
            <p className="text-muted-foreground">
              Manage customer orders and fulfillment
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Order Management
            </CardTitle>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-muted-foreground" />

                <Input
                  placeholder="Search orders by ID"
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  className="max-w-sm"
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">
                    All Status
                  </SelectItem>
                  <SelectItem value="pending">
                    Pending
                  </SelectItem>
                  <SelectItem value="success">
                    Processing
                  </SelectItem>
                  <SelectItem value="shipped">
                    Shipped
                  </SelectItem>
                  <SelectItem value="delivered">
                    Delivered
                  </SelectItem>
                  <SelectItem value="cancelled">
                    Cancelled
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            {isFetching ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.sku}
                        </TableCell>

                        <TableCell>
                          {formatDate(order.created_at)}
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            {order.orderitems.map(
                              (item, index) => (
                                <div
                                  key={index}
                                  className="text-sm"
                                >
                                  <span className="font-medium">
                                    {
                                      item.product.name
                                    }
                                  </span>

                                  <span className="text-muted-foreground">
                                    {' '}
                                    × {item.quantity}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="font-medium">
                          {formatPrice(
                            order.total_amount
                          )}
                        </TableCell>

                        <TableCell>
                          <Select
                            disabled={
                              updatingOrderId ===
                              order.id
                            }
                            value={order.status}
                            onValueChange={(value) =>
                              handleUpdateOrderStatus(
                                order.id,
                                value
                              )
                            }
                          >
                            <SelectTrigger className="w-[140px]">
                              <Badge
                                variant={getStatusVariant(
                                  order.status
                                )}
                                className="border-0 flex items-center gap-2"
                              >
                                {updatingOrderId ===
                                order.id ? (
                                  <>
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Updating...
                                  </>
                                ) : (
                                  order.status
                                )}
                              </Badge>
                            </SelectTrigger>

                            <SelectContent>
                              <SelectItem value="pending">
                                Pending
                              </SelectItem>
                              <SelectItem value="success">
                                Processing
                              </SelectItem>
                              <SelectItem value="shipped">
                                Shipped
                              </SelectItem>
                              <SelectItem value="delivered">
                                Delivered
                              </SelectItem>
                              <SelectItem value="cancelled">
                                Cancelled
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>

                        <TableCell className="text-right">
                          <DeleteOrderDialog
                            orderId={order.id}
                            frontendEndDeleteOrder={
                              frontendEndDeleteOrder
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-2 mt-10">
                  <Button
                    variant="outline"
                    onClick={() =>
                      fetchOrders(page - 1)
                    }
                    disabled={!prev}
                  >
                    Prev
                  </Button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => (
                      <Button
                        key={index}
                        variant={
                          page === index + 1
                            ? 'default'
                            : 'outline'
                        }
                        onClick={() =>
                          fetchOrders(index + 1)
                        }
                        className="w-10"
                      >
                        {index + 1}
                      </Button>
                    )
                  )}

                  <Button
                    variant="outline"
                    onClick={() =>
                      fetchOrders(page + 1)
                    }
                    disabled={!next}
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminOrders;