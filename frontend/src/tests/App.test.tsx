import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import '@testing-library/jest-dom/extend-expect';

describe('App Component', () => {
  test('renders the header', () => {
    render(<App />);
    const headerElement = screen.getByText(/Wake-on-LAN/i);
    expect(headerElement).toBeInTheDocument();
  });

  test('renders the refresh button', () => {
    render(<App />);
    const refreshButton = screen.getByText(/Refresh Status/i);
    expect(refreshButton).toBeInTheDocument();
  });

  test('renders PC status elements', async () => {
    render(<App />);
    const pcStatusElements = await screen.findAllByText(/'s PC:/i);
    expect(pcStatusElements.length).toBeGreaterThan(0);
  });

  test('calls wakePC function when wake button is clicked', async () => {
    render(<App />);
    const wakeButton = await screen.findByText(/Wake .*'s PC/i);
    fireEvent.click(wakeButton);
    const notification = await screen.findByText(/Sending Wake-on-LAN packet/i);
    expect(notification).toBeInTheDocument();
  });
});
