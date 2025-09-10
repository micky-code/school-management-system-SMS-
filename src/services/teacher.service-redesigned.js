// Teacher service redesigned for actual database structure
import ApiAdapter from './api-adapter';

class TeacherService {
  constructor() {
    this.apiAdapter = new ApiAdapter();
    this.baseEndpoint = '/teachers';
  }

  // Get all teachers with pagination and search
  async getAll(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      
      const url = `${this.baseEndpoint}?${queryParams.toString()}`;
      
      // Try authenticated endpoint first
      try {
        const response = await this.apiAdapter.get(url);
        if (response.success) {
          return response;
        }
      } catch (authError) {
        console.log('Auth endpoint failed, trying public endpoint');
      }
      
      // Fallback to public endpoint
      const publicUrl = `${this.baseEndpoint}/public?${queryParams.toString()}`;
      const response = await this.apiAdapter.get(publicUrl);
      return response;
      
    } catch (error) {
      console.error('Error fetching teachers:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch teachers',
        data: [],
        count: 0
      };
    }
  }

  // Get single teacher by ID
  async getById(id) {
    try {
      const response = await this.apiAdapter.get(`${this.baseEndpoint}/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching teacher:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch teacher'
      };
    }
  }

  // Create new teacher
  async create(teacherData) {
    try {
      // Handle FormData for file uploads
      const response = await this.apiAdapter.post(this.baseEndpoint, teacherData, {
        headers: {
          // Don't set Content-Type for FormData, let browser set it
        }
      });
      return response;
    } catch (error) {
      console.error('Error creating teacher:', error);
      return {
        success: false,
        message: error.message || 'Failed to create teacher'
      };
    }
  }

  // Update teacher
  async update(id, teacherData) {
    try {
      const response = await this.apiAdapter.put(`${this.baseEndpoint}/${id}`, teacherData, {
        headers: {
          // Don't set Content-Type for FormData, let browser set it
        }
      });
      return response;
    } catch (error) {
      console.error('Error updating teacher:', error);
      return {
        success: false,
        message: error.message || 'Failed to update teacher'
      };
    }
  }

  // Delete teacher
  async delete(id) {
    try {
      const response = await this.apiAdapter.delete(`${this.baseEndpoint}/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting teacher:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete teacher'
      };
    }
  }

  // Get teachers by search term
  async search(searchTerm, page = 1, limit = 10) {
    return this.getAll({
      search: searchTerm,
      page: page,
      limit: limit
    });
  }

  // Get teachers with user relationship data
  async getWithUserData(params = {}) {
    try {
      // This will use the main endpoint which includes user relationship data
      return await this.getAll(params);
    } catch (error) {
      console.error('Error fetching teachers with user data:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch teachers with user data',
        data: [],
        count: 0
      };
    }
  }

  // Validate teacher data before submission
  validateTeacherData(data) {
    const errors = {};

    // At least one name is required
    if (!data.eng_name && !data.khmer_name) {
      errors.general = 'At least one name (English or Khmer) is required';
    }

    // Validate English name
    if (data.eng_name && (data.eng_name.length < 2 || data.eng_name.length > 100)) {
      errors.eng_name = 'English name must be between 2 and 100 characters';
    }

    // Validate Khmer name
    if (data.khmer_name && (data.khmer_name.length < 2 || data.khmer_name.length > 100)) {
      errors.khmer_name = 'Khmer name must be between 2 and 100 characters';
    }

    // Validate phone
    if (data.phone && !/^[0-9+\-\s()]*$/.test(data.phone)) {
      errors.phone = 'Invalid phone number format';
    }

    // Validate positions
    if (data.positions && data.positions.length > 200) {
      errors.positions = 'Position must be less than 200 characters';
    }

    // Validate user_id
    if (data.user_id && (isNaN(data.user_id) || data.user_id <= 0)) {
      errors.user_id = 'User ID must be a positive number';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors: errors
    };
  }

  // Format teacher data for display
  formatTeacherForDisplay(teacher) {
    return {
      ...teacher,
      full_name: `${teacher.eng_name || ''} ${teacher.khmer_name || ''}`.trim(),
      display_name: teacher.eng_name || teacher.khmer_name || `Teacher #${teacher.id}`,
      has_image: !!teacher.image,
      image_url: teacher.image ? `/uploads/teachers/${teacher.image}` : null,
      has_user_account: !!teacher.user_id,
      user_info: teacher.email ? {
        username: teacher.username,
        email: teacher.email,
        role: teacher.role
      } : null
    };
  }

  // Get teachers formatted for dropdown/select options
  async getForDropdown() {
    try {
      const response = await this.getAll({ limit: 1000 }); // Get all teachers
      if (response.success) {
        return {
          success: true,
          data: (response.data || []).map(teacher => ({
            value: teacher.id,
            label: `${teacher.eng_name || ''} ${teacher.khmer_name || ''}`.trim() || `Teacher #${teacher.id}`,
            teacher: teacher
          }))
        };
      }
      return response;
    } catch (error) {
      console.error('Error fetching teachers for dropdown:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch teachers',
        data: []
      };
    }
  }
}

export default new TeacherService();
