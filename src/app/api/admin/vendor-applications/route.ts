import { NextRequest, NextResponse } from 'next/server';
import { firestoreService } from '../../../../lib/firebase/services';
import { requireRole } from '../../../../lib/utils/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and admin role
    await requireRole(request, 'ADMIN');

    const applications = await firestoreService.getAllVendorApplications();
    
    return NextResponse.json({
      success: true,
      data: applications,
      message: 'Vendor applications retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching vendor applications:', error);
    
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized - Admin role required' 
      }, { status: 401 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication and admin role
    await requireRole(request, 'ADMIN');

    const { action, applicationId, adminId, rejectionReason } = await request.json();

    if (action === 'approve') {
      await firestoreService.approveVendorApplication(applicationId, adminId);
      return NextResponse.json({
        success: true,
        message: 'Vendor application approved successfully'
      });
    } else if (action === 'reject') {
      if (!rejectionReason) {
        return NextResponse.json({
          success: false,
          error: 'Rejection reason is required'
        }, { status: 400 });
      }
      
      await firestoreService.rejectVendorApplication(applicationId, adminId, rejectionReason);
      return NextResponse.json({
        success: true,
        message: 'Vendor application rejected successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid action. Must be "approve" or "reject"'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing vendor application:', error);
    
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized - Admin role required' 
      }, { status: 401 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
