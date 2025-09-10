import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Search as SearchIcon } from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProgramsList = () => {
  // State for programs data
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  
  // State for form
  const [openForm, setOpenForm] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [formData, setFormData] = useState({
    id: null,
    program_name: '',
    department_id: '',
    degree_id: '',
    main_program_id: ''
  });
  
  // State for delete confirmation
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [programToDelete, setProgramToDelete] = useState(null);
  
  // State for related data (dropdowns)
  const [departments, setDepartments] = useState([]);
  const [degreeLevels, setDegreeLevels] = useState([]);
  const [mainPrograms, setMainPrograms] = useState([]);

  // Fetch programs with pagination and search
  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/programs', {
        params: {
          page: page + 1, // API uses 1-based indexing
          limit: rowsPerPage,
          search: searchTerm
        }
      });
      
      if (response.data.success) {
        setPrograms(response.data.data);
        setTotalCount(response.data.count);
      } else {
        setError('Failed to fetch programs');
        toast.error('Failed to fetch programs');
      }
    } catch (err) {
      console.error('Error fetching programs:', err);
      setError('Error fetching programs. Please try again.');
      toast.error('Error fetching programs. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch related data for dropdowns
  const fetchRelatedData = async () => {
    try {
      // Fetch departments
      const deptResponse = await axios.get('/api/programs/related/departments');
      if (deptResponse.data.success) {
        setDepartments(deptResponse.data.data);
      }
      
      // Fetch degree levels
      const degreeResponse = await axios.get('/api/programs/related/degree-levels');
      if (degreeResponse.data.success) {
        setDegreeLevels(degreeResponse.data.data);
      }
      
      // Fetch main programs
      const mainProgramResponse = await axios.get('/api/programs/related/main-programs');
      if (mainProgramResponse.data.success) {
        setMainPrograms(mainProgramResponse.data.data);
      }
    } catch (err) {
      console.error('Error fetching related data:', err);
      toast.error('Error fetching dropdown data');
    }
  };
  
  // Handle search input change with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debounce
    const timeout = setTimeout(() => {
      setPage(0); // Reset to first page when searching
      fetchPrograms();
    }, 500);
    
    setSearchTimeout(timeout);
  };
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Open form dialog for adding new program
  const handleAddProgram = () => {
    setFormData({
      id: null,
      program_name: '',
      department_id: '',
      degree_id: '',
      main_program_id: ''
    });
    setFormMode('add');
    setOpenForm(true);
  };
  
  // Open form dialog for editing program
  const handleEditProgram = (program) => {
    setFormData({
      id: program.id,
      program_name: program.program_name,
      department_id: program.department_id,
      degree_id: program.degree_id,
      main_program_id: program.main_program_id || ''
    });
    setFormMode('edit');
    setOpenForm(true);
  };
  
  // Handle form input change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!formData.program_name || !formData.department_id || !formData.degree_id) {
        toast.error('Please fill all required fields');
        return;
      }
      
      let response;
      
      if (formMode === 'add') {
        // Create new program
        response = await axios.post('/api/programs', formData);
        if (response.data.success) {
          toast.success('Program created successfully');
        }
      } else {
        // Update existing program
        response = await axios.put(`/api/programs/${formData.id}`, formData);
        if (response.data.success) {
          toast.success('Program updated successfully');
        }
      }
      
      // Close form and refresh data
      setOpenForm(false);
      fetchPrograms();
    } catch (err) {
      console.error('Error saving program:', err);
      toast.error(err.response?.data?.message || 'Error saving program');
    }
  };
  
  // Open delete confirmation dialog
  const handleDeleteClick = (program) => {
    setProgramToDelete(program);
    setOpenDeleteDialog(true);
  };
  
  // Handle program deletion
  const handleDeleteConfirm = async () => {
    try {
      if (!programToDelete) return;
      
      const response = await axios.delete(`/api/programs/${programToDelete.id}`);
      
      if (response.data.success) {
        toast.success('Program deleted successfully');
        fetchPrograms();
      } else {
        toast.error('Failed to delete program');
      }
    } catch (err) {
      console.error('Error deleting program:', err);
      toast.error(err.response?.data?.message || 'Error deleting program');
    } finally {
      setOpenDeleteDialog(false);
      setProgramToDelete(null);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchPrograms();
    fetchRelatedData();
  }, [page, rowsPerPage]);
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h4" component="h1" gutterBottom>
              Programs
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddProgram}
            >
              Add Program
            </Button>
          </Grid>
        </Grid>
        
        {/* Search Box */}
        <Box sx={{ mt: 2, mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search programs..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
            }}
          />
        </Box>
        
        {/* Programs Table */}
        <Card>
          <CardContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error" align="center">
                {error}
              </Typography>
            ) : (
              <>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Program Name</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell>Degree Level</TableCell>
                        <TableCell>Main Program</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {programs.length > 0 ? (
                        programs.map((program) => (
                          <TableRow key={program.id}>
                            <TableCell>{program.id}</TableCell>
                            <TableCell>{program.program_name}</TableCell>
                            <TableCell>{program.department_name}</TableCell>
                            <TableCell>{program.degree_level_name}</TableCell>
                            <TableCell>
                              {mainPrograms.find(mp => mp.id === program.main_program_id)?.name || '-'}
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                color="primary"
                                onClick={() => handleEditProgram(program)}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                color="error"
                                onClick={() => handleDeleteClick(program)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            No programs found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={totalCount}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            )}
          </CardContent>
        </Card>
      </Box>
      
      {/* Program Form Dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {formMode === 'add' ? 'Add New Program' : 'Edit Program'}
        </DialogTitle>
        <form onSubmit={handleFormSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="program_name"
                  label="Program Name"
                  value={formData.program_name}
                  onChange={handleFormChange}
                  fullWidth
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Department</InputLabel>
                  <Select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleFormChange}
                    label="Department"
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.department_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Degree Level</InputLabel>
                  <Select
                    name="degree_id"
                    value={formData.degree_id}
                    onChange={handleFormChange}
                    label="Degree Level"
                  >
                    {degreeLevels.map((degree) => (
                      <MenuItem key={degree.id} value={degree.id}>
                        {degree.degree}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Main Program</InputLabel>
                  <Select
                    name="main_program_id"
                    value={formData.main_program_id}
                    onChange={handleFormChange}
                    label="Main Program"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {mainPrograms.map((program) => (
                      <MenuItem key={program.id} value={program.id}>
                        {program.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenForm(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {formMode === 'add' ? 'Create' : 'Update'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the program "{programToDelete?.program_name}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProgramsList;
