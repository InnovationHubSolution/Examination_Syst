import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Paper,
    Stepper,
    Step,
    StepLabel,
    Button,
    Box,
    Grid,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormLabel,
    Card,
    CardContent,
    Chip,
    Alert,
    CircularProgress,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    LinearProgress,
    Divider,
    Checkbox
} from '@mui/material';
import {
    CloudUpload,
    Delete,
    CheckCircle,
    Warning,
    Info,
    Add,
    NavigateNext,
    NavigateBefore,
    Save,
    Send
} from '@mui/icons-material';
import axios from 'axios';

const steps = [
    'Applicant Type',
    'Programme Details',
    'Background Information',
    'Research Proposal',
    'Supporting Documents',
    'Additional Requirements',
    'Review & Submit'
];

const programmeLevels = [
    { value: 'graduate_certificate', label: 'Graduate Certificate' },
    { value: 'graduate_diploma', label: 'Graduate Diploma' },
    { value: 'postgraduate_certificate', label: 'Postgraduate Certificate' },
    { value: 'postgraduate_diploma', label: 'Postgraduate Diploma' },
    { value: 'masters', label: 'Masters' },
    { value: 'phd', label: 'PhD' }
];

const commissionTypes = [
    { value: 'public_service', label: 'Public Service Commission (PSC)' },
    { value: 'teaching_service', label: 'Teaching Service Commission (TSC)' },
    { value: 'police_service', label: 'Police Service Commission' },
    { value: 'other', label: 'Other' }
];

export default function PostGraduateApplication() {
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [eligibilityCheck, setEligibilityCheck] = useState(null);
    const [uploadProgress, setUploadProgress] = useState({});

    // Form data state
    const [formData, setFormData] = useState({
        applicantType: '',
        programmeDetails: {
            level: '',
            programmeTitle: '',
            institution: '',
            country: '',
            fieldOfStudy: '',
            duration: '',
            startDate: ''
        },
        undergraduateDetails: {
            degreeName: '',
            institution: '',
            completionDate: '',
            overallGPA: '',
            completionStatus: '',
            originalAwardEndDate: ''
        },
        workforceDetails: {
            employer: '',
            position: '',
            department: '',
            yearsOfService: '',
            commissionType: ''
        },
        researchProposal: {
            researchTopic: '',
            researchOutline: '',
            priorityAreaAlignment: '',
            proposedSupervisor: {
                name: '',
                institution: '',
                email: ''
            }
        },
        institutionRequirements: {
            minimumGPARequired: '',
            minimumGPAMet: false,
            otherRequirementsMet: false,
            requirementsDetails: ''
        },
        supportingDocuments: [],
        commissionApproval: {
            required: false,
            status: 'pending',
            approvalDate: '',
            approvalReference: '',
            conditions: '',
            notes: ''
        },
        recommendations: [],
        phdSpecificRequirements: {
            researchProposalSubmitted: false,
            supervisorSupportLetter: false,
            progressReport: false,
            supervisorDetails: {
                name: '',
                institution: '',
                email: '',
                phone: ''
            }
        },
        scholarshipPriorityFramework: {
            alignedArea: '',
            justification: ''
        },
        regularAttachments: []
    });

    const handleInputChange = (section, field, value) => {
        if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleNestedInputChange = (section, subsection, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [subsection]: {
                    ...prev[section][subsection],
                    [field]: value
                }
            }
        }));
    };

    const handleFileUpload = async (documentType, file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', documentType);

        try {
            setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));

            // Simulated upload - replace with actual upload endpoint
            const response = await axios.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(prev => ({ ...prev, [documentType]: percentCompleted }));
                }
            });

            const newDocument = {
                documentType,
                fileName: file.name,
                fileUrl: response.data.fileUrl || `/uploads/${file.name}`,
                uploadDate: new Date()
            };

            setFormData(prev => ({
                ...prev,
                supportingDocuments: [...prev.supportingDocuments, newDocument]
            }));

            setUploadProgress(prev => ({ ...prev, [documentType]: 100 }));
            setTimeout(() => {
                setUploadProgress(prev => {
                    const newProgress = { ...prev };
                    delete newProgress[documentType];
                    return newProgress;
                });
            }, 2000);

            setSuccess('Document uploaded successfully');
        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to upload document: ' + (err.response?.data?.message || err.message));
            setUploadProgress(prev => {
                const newProgress = { ...prev };
                delete newProgress[documentType];
                return newProgress;
            });
        }
    };

    const handleDeleteDocument = (index) => {
        setFormData(prev => ({
            ...prev,
            supportingDocuments: prev.supportingDocuments.filter((_, i) => i !== index)
        }));
    };

    const handleAddRecommendation = () => {
        setFormData(prev => ({
            ...prev,
            recommendations: [
                ...prev.recommendations,
                {
                    recommenderName: '',
                    position: '',
                    institution: '',
                    relationship: '',
                    letterUrl: '',
                    submittedDate: ''
                }
            ]
        }));
    };

    const handleAddAttachment = () => {
        setFormData(prev => ({
            ...prev,
            regularAttachments: [
                ...prev.regularAttachments,
                {
                    organisation: '',
                    position: '',
                    duration: '',
                    relevantToStudy: true,
                    description: ''
                }
            ]
        }));
    };

    const handleCheckEligibility = async () => {
        try {
            setLoading(true);
            setError(null);

            // Create a temporary application to check eligibility
            const response = await axios.post('/api/postgraduate', {
                ...formData,
                applicationStatus: 'draft'
            });

            const eligibilityResponse = await axios.post(
                `/api/postgraduate/${response.data._id}/check-eligibility`
            );

            setEligibilityCheck(eligibilityResponse.data);
            setLoading(false);
        } catch (err) {
            console.error('Eligibility check error:', err);
            setError(err.response?.data?.message || 'Failed to check eligibility');
            setLoading(false);
        }
    };

    const handleSaveDraft = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.post('/api/postgraduate', {
                ...formData,
                applicationStatus: 'draft'
            });

            setSuccess('Application draft saved successfully');
            setLoading(false);
        } catch (err) {
            console.error('Save draft error:', err);
            setError(err.response?.data?.message || 'Failed to save draft');
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(null);

            // Create application
            const response = await axios.post('/api/postgraduate', formData);

            // Submit for review
            await axios.post(`/api/postgraduate/${response.data._id}/submit`);

            setSuccess('Application submitted successfully!');
            setLoading(false);

            // Redirect after success
            setTimeout(() => {
                window.location.href = '/app/student/profile';
            }, 2000);
        } catch (err) {
            console.error('Submit error:', err);
            setError(err.response?.data?.message || 'Failed to submit application');
            setLoading(false);
        }
    };

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        window.scrollTo(0, 0);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
        window.scrollTo(0, 0);
    };

    const isPHD = formData.programmeDetails.level === 'phd';
    const isCurrentWorkforce = formData.applicantType === 'current_workforce';
    const isRecentUndergraduate = formData.applicantType === 'recent_undergraduate';
    const needsCommissionApproval = ['public_service', 'teaching_service', 'police_service'].includes(
        formData.workforceDetails.commissionType
    );

    const renderStepContent = (step) => {
        switch (step) {
            case 0: // Applicant Type
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Select Your Applicant Type
                        </Typography>
                        <FormControl component="fieldset" fullWidth>
                            <RadioGroup
                                value={formData.applicantType}
                                onChange={(e) => handleInputChange(null, 'applicantType', e.target.value)}
                            >
                                <Card sx={{ mb: 2, border: formData.applicantType === 'current_workforce' ? '2px solid #2196f3' : 'none' }}>
                                    <CardContent>
                                        <FormControlLabel
                                            value="current_workforce"
                                            control={<Radio />}
                                            label={
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        Current Workforce
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        For employees in public service, teaching service, police service, or other organizations
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </CardContent>
                                </Card>
                                <Card sx={{ border: formData.applicantType === 'recent_undergraduate' ? '2px solid #2196f3' : 'none' }}>
                                    <CardContent>
                                        <FormControlLabel
                                            value="recent_undergraduate"
                                            control={<Radio />}
                                            label={
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        Recent Undergraduate Completer
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        For students who have recently completed or are completing their undergraduate degree
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </CardContent>
                                </Card>
                            </RadioGroup>
                        </FormControl>
                    </Box>
                );

            case 1: // Programme Details
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Programme Details
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Programme Level</InputLabel>
                                    <Select
                                        value={formData.programmeDetails.level}
                                        label="Programme Level"
                                        onChange={(e) => handleInputChange('programmeDetails', 'level', e.target.value)}
                                    >
                                        {programmeLevels.map(level => (
                                            <MenuItem key={level.value} value={level.value}>
                                                {level.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Programme Title"
                                    value={formData.programmeDetails.programmeTitle}
                                    onChange={(e) => handleInputChange('programmeDetails', 'programmeTitle', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Institution"
                                    value={formData.programmeDetails.institution}
                                    onChange={(e) => handleInputChange('programmeDetails', 'institution', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Country"
                                    value={formData.programmeDetails.country}
                                    onChange={(e) => handleInputChange('programmeDetails', 'country', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Field of Study"
                                    value={formData.programmeDetails.fieldOfStudy}
                                    onChange={(e) => handleInputChange('programmeDetails', 'fieldOfStudy', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Duration (in years)"
                                    type="number"
                                    value={formData.programmeDetails.duration}
                                    onChange={(e) => handleInputChange('programmeDetails', 'duration', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Programme Start Date"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    value={formData.programmeDetails.startDate}
                                    onChange={(e) => handleInputChange('programmeDetails', 'startDate', e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                );

            case 2: // Background Information
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Background Information
                        </Typography>

                        {isCurrentWorkforce && (
                            <>
                                <Typography variant="subtitle1" color="primary" gutterBottom sx={{ mt: 2 }}>
                                    Employment Details
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            required
                                            label="Employer"
                                            value={formData.workforceDetails.employer}
                                            onChange={(e) => handleInputChange('workforceDetails', 'employer', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            required
                                            label="Position"
                                            value={formData.workforceDetails.position}
                                            onChange={(e) => handleInputChange('workforceDetails', 'position', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Department"
                                            value={formData.workforceDetails.department}
                                            onChange={(e) => handleInputChange('workforceDetails', 'department', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            required
                                            label="Years of Service"
                                            type="number"
                                            value={formData.workforceDetails.yearsOfService}
                                            onChange={(e) => handleInputChange('workforceDetails', 'yearsOfService', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth required>
                                            <InputLabel>Commission Type</InputLabel>
                                            <Select
                                                value={formData.workforceDetails.commissionType}
                                                label="Commission Type"
                                                onChange={(e) => {
                                                    handleInputChange('workforceDetails', 'commissionType', e.target.value);
                                                    const needsApproval = ['public_service', 'teaching_service', 'police_service'].includes(e.target.value);
                                                    handleInputChange('commissionApproval', 'required', needsApproval);
                                                }}
                                            >
                                                {commissionTypes.map(type => (
                                                    <MenuItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </>
                        )}

                        {isRecentUndergraduate && (
                            <>
                                <Typography variant="subtitle1" color="primary" gutterBottom sx={{ mt: 2 }}>
                                    Undergraduate Degree Details
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            required
                                            label="Degree Name"
                                            value={formData.undergraduateDetails.degreeName}
                                            onChange={(e) => handleInputChange('undergraduateDetails', 'degreeName', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            required
                                            label="Institution"
                                            value={formData.undergraduateDetails.institution}
                                            onChange={(e) => handleInputChange('undergraduateDetails', 'institution', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            required
                                            label="Completion Date"
                                            type="date"
                                            InputLabelProps={{ shrink: true }}
                                            value={formData.undergraduateDetails.completionDate}
                                            onChange={(e) => handleInputChange('undergraduateDetails', 'completionDate', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            required
                                            label="Overall GPA"
                                            type="number"
                                            inputProps={{ step: '0.01', min: '0', max: '4.0' }}
                                            value={formData.undergraduateDetails.overallGPA}
                                            onChange={(e) => handleInputChange('undergraduateDetails', 'overallGPA', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth required>
                                            <InputLabel>Completion Status</InputLabel>
                                            <Select
                                                value={formData.undergraduateDetails.completionStatus}
                                                label="Completion Status"
                                                onChange={(e) => handleInputChange('undergraduateDetails', 'completionStatus', e.target.value)}
                                            >
                                                <MenuItem value="completed">Completed</MenuItem>
                                                <MenuItem value="in_progress">In Progress (Final Year)</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            required
                                            label="Original Award End Date"
                                            type="date"
                                            InputLabelProps={{ shrink: true }}
                                            helperText="The expected completion date according to your original scholarship award"
                                            value={formData.undergraduateDetails.originalAwardEndDate}
                                            onChange={(e) => handleInputChange('undergraduateDetails', 'originalAwardEndDate', e.target.value)}
                                        />
                                    </Grid>
                                </Grid>
                            </>
                        )}

                        <Typography variant="subtitle1" color="primary" gutterBottom sx={{ mt: 3 }}>
                            Institution Requirements
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Minimum GPA Required by Institution"
                                    type="number"
                                    inputProps={{ step: '0.01', min: '0', max: '4.0' }}
                                    value={formData.institutionRequirements.minimumGPARequired}
                                    onChange={(e) => handleInputChange('institutionRequirements', 'minimumGPARequired', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Do you meet the minimum GPA?</InputLabel>
                                    <Select
                                        value={formData.institutionRequirements.minimumGPAMet}
                                        label="Do you meet the minimum GPA?"
                                        onChange={(e) => handleInputChange('institutionRequirements', 'minimumGPAMet', e.target.value === 'true')}
                                    >
                                        <MenuItem value="true">Yes</MenuItem>
                                        <MenuItem value="false">No</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Other Institution Requirements"
                                    placeholder="List any other requirements (e.g., English proficiency, prerequisite courses)"
                                    value={formData.institutionRequirements.requirementsDetails}
                                    onChange={(e) => handleInputChange('institutionRequirements', 'requirementsDetails', e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                );

            case 3: // Research Proposal
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Research Proposal
                        </Typography>
                        <Alert severity="info" sx={{ mb: 3 }}>
                            Your research topic must directly contribute to an area aligned with the Scholarship Priority Framework
                        </Alert>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Research Topic"
                                    value={formData.researchProposal.researchTopic}
                                    onChange={(e) => handleInputChange('researchProposal', 'researchTopic', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    required
                                    multiline
                                    rows={8}
                                    label="Research Outline (One Page Maximum)"
                                    helperText="Provide a concise outline of your proposed research"
                                    value={formData.researchProposal.researchOutline}
                                    onChange={(e) => handleInputChange('researchProposal', 'researchOutline', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Scholarship Priority Framework - Aligned Area"
                                    placeholder="e.g., Education, Health, Agriculture, Tourism, Infrastructure"
                                    value={formData.scholarshipPriorityFramework.alignedArea}
                                    onChange={(e) => handleInputChange('scholarshipPriorityFramework', 'alignedArea', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    required
                                    multiline
                                    rows={4}
                                    label="Justification for Priority Area Alignment"
                                    helperText="Explain how your research contributes to this priority area"
                                    value={formData.scholarshipPriorityFramework.justification}
                                    onChange={(e) => handleInputChange('scholarshipPriorityFramework', 'justification', e.target.value)}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle1" gutterBottom>
                                    Proposed Supervisor
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Supervisor Name"
                                    value={formData.researchProposal.proposedSupervisor.name}
                                    onChange={(e) => handleNestedInputChange('researchProposal', 'proposedSupervisor', 'name', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Supervisor Institution"
                                    value={formData.researchProposal.proposedSupervisor.institution}
                                    onChange={(e) => handleNestedInputChange('researchProposal', 'proposedSupervisor', 'institution', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Supervisor Email"
                                    type="email"
                                    value={formData.researchProposal.proposedSupervisor.email}
                                    onChange={(e) => handleNestedInputChange('researchProposal', 'proposedSupervisor', 'email', e.target.value)}
                                />
                            </Grid>
                        </Grid>

                        {isPHD && (
                            <>
                                <Divider sx={{ my: 3 }} />
                                <Typography variant="subtitle1" color="primary" gutterBottom>
                                    PhD-Specific Requirements
                                </Typography>
                                <Alert severity="warning" sx={{ mb: 2 }}>
                                    PhD applications require either a research proposal with supervisor support letter (for new students)
                                    OR a progress report with supervisor support letter (for continuing students)
                                </Alert>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={4}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formData.phdSpecificRequirements.researchProposalSubmitted}
                                                    onChange={(e) => handleInputChange('phdSpecificRequirements', 'researchProposalSubmitted', e.target.checked)}
                                                />
                                            }
                                            label="Research Proposal Submitted"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formData.phdSpecificRequirements.supervisorSupportLetter}
                                                    onChange={(e) => handleInputChange('phdSpecificRequirements', 'supervisorSupportLetter', e.target.checked)}
                                                />
                                            }
                                            label="Supervisor Support Letter"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formData.phdSpecificRequirements.progressReport}
                                                    onChange={(e) => handleInputChange('phdSpecificRequirements', 'progressReport', e.target.checked)}
                                                />
                                            }
                                            label="Progress Report (Continuing Students)"
                                        />
                                    </Grid>
                                </Grid>
                            </>
                        )}
                    </Box>
                );

            case 4: // Supporting Documents
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Supporting Documents
                        </Typography>
                        <Alert severity="info" sx={{ mb: 3 }}>
                            Required documents: CV, Transcripts, Research Proposal (if research degree), Recommendation Letters
                        </Alert>

                        <Grid container spacing={2}>
                            {['cv', 'transcripts', 'research_proposal', 'recommendation_letter', 'other'].map(docType => (
                                <Grid item xs={12} key={docType}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="subtitle1">
                                                    {docType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </Typography>
                                                <Button
                                                    variant="outlined"
                                                    component="label"
                                                    startIcon={<CloudUpload />}
                                                >
                                                    Upload
                                                    <input
                                                        type="file"
                                                        hidden
                                                        onChange={(e) => {
                                                            if (e.target.files[0]) {
                                                                handleFileUpload(docType, e.target.files[0]);
                                                            }
                                                        }}
                                                    />
                                                </Button>
                                            </Box>
                                            {uploadProgress[docType] !== undefined && (
                                                <Box sx={{ mt: 2 }}>
                                                    <LinearProgress variant="determinate" value={uploadProgress[docType]} />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {uploadProgress[docType]}% uploaded
                                                    </Typography>
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        {formData.supportingDocuments.length > 0 && (
                            <>
                                <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
                                    Uploaded Documents
                                </Typography>
                                <TableContainer component={Paper} variant="outlined">
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Document Type</TableCell>
                                                <TableCell>File Name</TableCell>
                                                <TableCell>Upload Date</TableCell>
                                                <TableCell align="right">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {formData.supportingDocuments.map((doc, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        {doc.documentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    </TableCell>
                                                    <TableCell>{doc.fileName}</TableCell>
                                                    <TableCell>
                                                        {new Date(doc.uploadDate).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleDeleteDocument(index)}
                                                        >
                                                            <Delete />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </Box>
                );

            case 5: // Additional Requirements
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Additional Requirements
                        </Typography>

                        {isCurrentWorkforce && needsCommissionApproval && (
                            <>
                                <Alert severity="warning" sx={{ mb: 3 }}>
                                    Commission approval is required for your position
                                </Alert>
                                <Typography variant="subtitle1" color="primary" gutterBottom>
                                    Commission Approval Details
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth required>
                                            <InputLabel>Approval Status</InputLabel>
                                            <Select
                                                value={formData.commissionApproval.status}
                                                label="Approval Status"
                                                onChange={(e) => handleInputChange('commissionApproval', 'status', e.target.value)}
                                            >
                                                <MenuItem value="pending">Pending</MenuItem>
                                                <MenuItem value="approved">Approved</MenuItem>
                                                <MenuItem value="rejected">Rejected</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    {formData.commissionApproval.status === 'approved' && (
                                        <>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    required
                                                    label="Approval Date"
                                                    type="date"
                                                    InputLabelProps={{ shrink: true }}
                                                    value={formData.commissionApproval.approvalDate}
                                                    onChange={(e) => handleInputChange('commissionApproval', 'approvalDate', e.target.value)}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    required
                                                    label="Approval Reference Number"
                                                    value={formData.commissionApproval.approvalReference}
                                                    onChange={(e) => handleInputChange('commissionApproval', 'approvalReference', e.target.value)}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    multiline
                                                    rows={3}
                                                    label="Conditions (if any)"
                                                    value={formData.commissionApproval.conditions}
                                                    onChange={(e) => handleInputChange('commissionApproval', 'conditions', e.target.value)}
                                                />
                                            </Grid>
                                        </>
                                    )}
                                </Grid>
                            </>
                        )}

                        {isRecentUndergraduate && (
                            <>
                                <Typography variant="subtitle1" color="primary" gutterBottom sx={{ mt: 3 }}>
                                    Regular Attachments with Organisations
                                </Typography>
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    List any work experience or attachments with relevant organizations
                                </Alert>
                                {formData.regularAttachments.map((attachment, index) => (
                                    <Card key={index} sx={{ mb: 2 }} variant="outlined">
                                        <CardContent>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Organisation"
                                                        value={attachment.organisation}
                                                        onChange={(e) => {
                                                            const newAttachments = [...formData.regularAttachments];
                                                            newAttachments[index].organisation = e.target.value;
                                                            setFormData(prev => ({ ...prev, regularAttachments: newAttachments }));
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Position"
                                                        value={attachment.position}
                                                        onChange={(e) => {
                                                            const newAttachments = [...formData.regularAttachments];
                                                            newAttachments[index].position = e.target.value;
                                                            setFormData(prev => ({ ...prev, regularAttachments: newAttachments }));
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Duration"
                                                        placeholder="e.g., 6 months"
                                                        value={attachment.duration}
                                                        onChange={(e) => {
                                                            const newAttachments = [...formData.regularAttachments];
                                                            newAttachments[index].duration = e.target.value;
                                                            setFormData(prev => ({ ...prev, regularAttachments: newAttachments }));
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        fullWidth
                                                        multiline
                                                        rows={2}
                                                        label="Description of Relevance to Study"
                                                        value={attachment.description}
                                                        onChange={(e) => {
                                                            const newAttachments = [...formData.regularAttachments];
                                                            newAttachments[index].description = e.target.value;
                                                            setFormData(prev => ({ ...prev, regularAttachments: newAttachments }));
                                                        }}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                ))}
                                <Button
                                    variant="outlined"
                                    startIcon={<Add />}
                                    onClick={handleAddAttachment}
                                    sx={{ mb: 3 }}
                                >
                                    Add Attachment
                                </Button>

                                <Typography variant="subtitle1" color="primary" gutterBottom>
                                    Lecturer Recommendations
                                </Typography>
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    At least one recommendation letter from a lecturer is required
                                </Alert>
                                {formData.recommendations.map((rec, index) => (
                                    <Card key={index} sx={{ mb: 2 }} variant="outlined">
                                        <CardContent>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Recommender Name"
                                                        value={rec.recommenderName}
                                                        onChange={(e) => {
                                                            const newRecs = [...formData.recommendations];
                                                            newRecs[index].recommenderName = e.target.value;
                                                            setFormData(prev => ({ ...prev, recommendations: newRecs }));
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Position/Title"
                                                        value={rec.position}
                                                        onChange={(e) => {
                                                            const newRecs = [...formData.recommendations];
                                                            newRecs[index].position = e.target.value;
                                                            setFormData(prev => ({ ...prev, recommendations: newRecs }));
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Institution"
                                                        value={rec.institution}
                                                        onChange={(e) => {
                                                            const newRecs = [...formData.recommendations];
                                                            newRecs[index].institution = e.target.value;
                                                            setFormData(prev => ({ ...prev, recommendations: newRecs }));
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Relationship"
                                                        placeholder="e.g., Lecturer, Thesis Supervisor"
                                                        value={rec.relationship}
                                                        onChange={(e) => {
                                                            const newRecs = [...formData.recommendations];
                                                            newRecs[index].relationship = e.target.value;
                                                            setFormData(prev => ({ ...prev, recommendations: newRecs }));
                                                        }}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                ))}
                                <Button
                                    variant="outlined"
                                    startIcon={<Add />}
                                    onClick={handleAddRecommendation}
                                >
                                    Add Recommendation
                                </Button>
                            </>
                        )}
                    </Box>
                );

            case 6: // Review & Submit
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Review Your Application
                        </Typography>

                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="subtitle1" color="primary" gutterBottom>
                                    Applicant Type
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {formData.applicantType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Typography>

                                <Divider sx={{ my: 2 }} />

                                <Typography variant="subtitle1" color="primary" gutterBottom>
                                    Programme Details
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Level:</strong> {programmeLevels.find(p => p.value === formData.programmeDetails.level)?.label || '-'}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Programme:</strong> {formData.programmeDetails.programmeTitle || '-'}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Institution:</strong> {formData.programmeDetails.institution || '-'} ({formData.programmeDetails.country || '-'})
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Duration:</strong> {formData.programmeDetails.duration || '-'} years
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Start Date:</strong> {formData.programmeDetails.startDate || '-'}
                                </Typography>

                                <Divider sx={{ my: 2 }} />

                                <Typography variant="subtitle1" color="primary" gutterBottom>
                                    Research Topic
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    {formData.researchProposal.researchTopic || '-'}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Priority Area:</strong> {formData.scholarshipPriorityFramework.alignedArea || '-'}
                                </Typography>

                                <Divider sx={{ my: 2 }} />

                                <Typography variant="subtitle1" color="primary" gutterBottom>
                                    Supporting Documents
                                </Typography>
                                <Typography variant="body2">
                                    {formData.supportingDocuments.length} document(s) uploaded
                                </Typography>
                            </CardContent>
                        </Card>

                        <Button
                            variant="outlined"
                            fullWidth
                            size="large"
                            onClick={handleCheckEligibility}
                            disabled={loading}
                            sx={{ mb: 2 }}
                        >
                            Check Eligibility
                        </Button>

                        {eligibilityCheck && (
                            <Alert
                                severity={eligibilityCheck.eligible ? 'success' : 'warning'}
                                icon={eligibilityCheck.eligible ? <CheckCircle /> : <Warning />}
                                sx={{ mb: 3 }}
                            >
                                <Typography variant="subtitle2" gutterBottom>
                                    {eligibilityCheck.eligible ? 'You are eligible!' : 'Eligibility Issues Found'}
                                </Typography>
                                {eligibilityCheck.missingRequirements && eligibilityCheck.missingRequirements.length > 0 && (
                                    <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                                        {eligibilityCheck.missingRequirements.map((req, index) => (
                                            <li key={index}>
                                                <Typography variant="body2">{req}</Typography>
                                            </li>
                                        ))}
                                    </Box>
                                )}
                            </Alert>
                        )}

                        <Alert severity="info" sx={{ mb: 2 }}>
                            Please review all information carefully before submitting. Once submitted, your application will be reviewed by the scholarship committee.
                        </Alert>
                    </Box>
                );

            default:
                return null;
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Post-Graduate Scholarship Application
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Apply for post-graduate studies (Graduate Certificate, Diploma, Masters, or PhD)
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            <Paper sx={{ p: 3, mb: 3 }}>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {renderStepContent(activeStep)}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                        disabled={activeStep === 0 || loading}
                        onClick={handleBack}
                        startIcon={<NavigateBefore />}
                    >
                        Back
                    </Button>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={handleSaveDraft}
                            startIcon={<Save />}
                            disabled={loading}
                        >
                            Save Draft
                        </Button>
                        {activeStep === steps.length - 1 ? (
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                startIcon={<Send />}
                                disabled={loading || !formData.applicantType}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Submit Application'}
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                onClick={handleNext}
                                endIcon={<NavigateNext />}
                                disabled={loading || (activeStep === 0 && !formData.applicantType)}
                            >
                                Next
                            </Button>
                        )}
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}
