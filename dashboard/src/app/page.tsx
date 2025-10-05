import { Chart } from "chart.js";
import Image from "next/image";
import { sampleApplicationData, status } from "@/data/sample-applications-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Home() {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
  };

  return (
   <div className="p-8">
    <Card>
      <CardHeader>
        <CardTitle>Application Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Job Title</TableHead>
              <TableHead className="text-center">Applied</TableHead>
              <TableHead className="text-center">Screen</TableHead>
              <TableHead className="text-center">Interview</TableHead>
              <TableHead className="text-center">Offer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sampleApplicationData.map((application, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-orange-500 text-white">
                        {application.title.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{application.title}</div>
                      <div className="text-sm text-muted-foreground">{application.company}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {application.status === status.APPLIED && (
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 text-white rounded-full text-sm font-medium">
                      {formatDate(application.dateApplied)}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {application.status === status.ONLINE_ASSESSMENT && (
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 text-white rounded-full text-sm font-medium">
                      {formatDate(application.dateApplied)}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {application.status === status.INTERVIEW && (
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 text-white rounded-full text-sm font-medium">
                      {formatDate(application.dateApplied)}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {application.status === status.OFFER && (
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 text-white rounded-full text-sm font-medium">
                      {formatDate(application.dateApplied)}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
   </div>
  );
}
