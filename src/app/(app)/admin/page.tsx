
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Check, X, Loader2 } from 'lucide-react';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { useCollection, type WithId } from '@/firebase/firestore/use-collection';

// This is the data structure for a USN change request from our database.
export type UsnChangeRequest = {
    id: string;
    userId: string;
    studentName: string;
    currentUsn: string;
    newUsn: string;
    reason: string;
    status: 'pending' | 'approved' | 'denied';
    requestedAt: any;
};

// This is the admin page, which should only be accessible to faculty members.
export default function AdminPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  // We get the user's role from the URL to decide if they can see this page.
  const role = searchParams.get('role');

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // This creates a database query to get all USN change requests that are "pending".
  const requestsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'usn_change_requests'), where('status', '==', 'pending'));
  }, [firestore]);

  // This hook fetches the data from our query and updates it in real-time.
  const { data: requests, isLoading: isLoadingRequests } = useCollection<UsnChangeRequest>(requestsQuery);

  // This effect runs when the page loads to check if the user is a faculty member.
  // If not, it redirects them back to the main dashboard.
  useEffect(() => {
    if (role !== 'faculty') {
      router.push('/dashboard');
      return;
    }
  }, [role, router]);

  // This function approves a student's USN change request.
  const handleApprove = async (request: WithId<UsnChangeRequest>) => {
    if (!firestore) return;
    setActionLoading(request.id);
    try {
        // A "batch write" lets us update two different documents at the same time.
        // If one update fails, the other one is rolled back, ensuring data consistency.
        const batch = writeBatch(firestore);

        // First, we update the status of the request to "approved".
        const requestRef = doc(firestore, 'usn_change_requests', request.id);
        batch.update(requestRef, { status: 'approved' });

        // Second, we update the student's actual USN in their user profile.
        const userRef = doc(firestore, 'users', request.userId);
        batch.update(userRef, { usn: request.newUsn });

        await batch.commit();

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
  };

  // This function denies a student's USN change request.
  const handleDeny = async (requestId: string) => {
    if (!firestore) return;
    setActionLoading(requestId);
    try {
        const requestRef = doc(firestore, 'usn_change_requests', requestId);
        await updateDoc(requestRef, { status: 'denied' });
        toast({
            title: 'Request Denied',
            description: 'The USN change request has been denied.',
            variant: 'destructive',
        });
    } catch(error: any) {
         toast({
            title: 'Action Failed',
            description: error.message,
            variant: 'destructive',
        });
    } finally {
        setActionLoading(null);
    }
  };

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
                {isLoadingRequests ? (
                     <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                        </TableCell>
                    </TableRow>
                ) : !requests || requests.length === 0 ? (
                  // This message shows if there are no pending requests to review.
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No pending requests.
                    </TableCell>
                  </TableRow>
                ) : (
                  // We map over the requests and create a table row for each one.
                  requests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.studentName}</TableCell>
                      <TableCell>{req.currentUsn}</TableCell>
                      <TableCell>{req.newUsn}</TableCell>
                      <TableCell>{req.reason}</TableCell>
                      <TableCell>
                        <Badge variant={req.status === 'pending' ? 'secondary' : 'default'}>{req.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {req.status === 'pending' && (
                          <div className="space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleApprove(req)} disabled={actionLoading === req.id}>
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
