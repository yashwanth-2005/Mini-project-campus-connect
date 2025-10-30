
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getPendingUsnRequests, approveUsnChange, denyUsnChange, UsnChangeRequest } from '@/lib/mock-db';
import { Badge } from '@/components/ui/badge';
import { Check, X, Loader2 } from 'lucide-react';

export default function AdminPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const role = searchParams.get('role');

  const [requests, setRequests] = useState<UsnChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // When the page loads, it checks if the user is a faculty member.
  // If not, it sends them back to the dashboard.
  useEffect(() => {
    if (role !== 'faculty') {
      router.push('/dashboard');
      return;
    }
    // Otherwise, it loads the pending requests.
    setRequests(getPendingUsnRequests());
    setIsLoading(false);
  }, [role, router]);

  // Approves a student's USN change request and shows a success message.
  const handleApprove = (requestId: string) => {
    setActionLoading(requestId);
    setTimeout(() => {
      try {
        approveUsnChange(requestId);
        setRequests(getPendingUsnRequests()); 
        toast({
          title: 'Request Approved',
          description: "The student's USN has been successfully updated.",
        });
      } catch (error: any) {
        toast({
          title: 'Approval Failed',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setActionLoading(null);
      }
    }, 500); // A small delay to simulate a network request.
  };

  // Denies a student's USN change request and shows a message.
  const handleDeny = (requestId: string) => {
    setActionLoading(requestId);
    setTimeout(() => {
      denyUsnChange(requestId);
      setRequests(getPendingUsnRequests()); 
      toast({
        title: 'Request Denied',
        description: 'The USN change request has been denied.',
        variant: 'destructive',
      });
      setActionLoading(null);
    }, 500); // A small delay to simulate a network request.
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Admin Panel</h1>
        <p className="text-muted-foreground">Manage campus content and approvals.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>USN Change Requests</CardTitle>
          <CardDescription>Review student requests to change their University Seat Number.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Current USN</TableHead>
                  <TableHead>Requested USN</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  // Shows a message if there are no pending requests.
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No pending requests.
                    </TableCell>
                  </TableRow>
                ) : (
                  // Renders a table row for each pending request.
                  requests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.studentName}</TableCell>
                      <TableCell>{req.currentUsn}</TableCell>
                      <TableCell className='flex items-center gap-2'>
                        {req.newUsn}
                      </TableCell>
                      <TableCell>{req.reason}</TableCell>
                      <TableCell>
                        <Badge variant={req.status === 'pending' ? 'secondary' : 'default'}>{req.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {req.status === 'pending' && (
                          <div className="space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleApprove(req.id)} disabled={actionLoading === req.id}>
                              {actionLoading === req.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                               Approve
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeny(req.id)} disabled={actionLoading === req.id}>
                               {actionLoading === req.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
                               Deny
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
