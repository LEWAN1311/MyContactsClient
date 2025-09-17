// Mock for react-router-dom
export const BrowserRouter = ({ children }) => children;
export const Router = ({ children }) => children;
export const Routes = ({ children }) => children;
export const Route = ({ children }) => children;
export const Link = ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>;
export const useNavigate = jest.fn();
export const useLocation = jest.fn(() => ({ pathname: '/' }));
export const useParams = jest.fn(() => ({}));
export const useSearchParams = jest.fn(() => [new URLSearchParams(), jest.fn()]);
export const Navigate = ({ to }) => <div data-testid="navigate" data-to={to} />;
export const Outlet = () => <div data-testid="outlet" />;

// Default export
export default {
  BrowserRouter,
  Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
  Navigate,
  Outlet
};
