import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EmployeeDashboard from './Pages/EmployeeDashboard';
import { MemoryRouter } from 'react-router-dom';

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    useNavigate: jest.fn(),
  };
});

describe('EmployeeDashboard Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.spyOn(global, 'fetch');
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    global.fetch.mockRestore();
    jest.resetAllMocks();
  });

  test('renders employee information after fetching', async () => {
    const mockEmployeeInfo = {
      FullName: 'John Doe',
      Username: 'johndoe',
      Email: 'john.doe@example.com',
      EmployeeID: 'EMP123',
      Position: 'Developer',
      Department: 'Engineering',
      Manager: 'Jane Smith',
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockEmployeeInfo),
    });

    render(
      <MemoryRouter>
        <EmployeeDashboard />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/John Doe/i)).toBeInTheDocument());

    expect(screen.getByText(/john.doe@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/EMP123/i)).toBeInTheDocument();
    expect(screen.getByText(/Developer/i)).toBeInTheDocument();
    expect(screen.getByText(/Engineering/i)).toBeInTheDocument();
    expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
  });
});
