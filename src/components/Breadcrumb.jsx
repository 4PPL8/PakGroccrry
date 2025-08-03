import { Link } from 'react-router-dom';

const Breadcrumb = ({ items }) => {
  return (
    <nav className="mb-8">
      <ol className="flex text-gray-600 text-sm">
        {items.map((item, index) => (
          <li key={index}>
            {index < items.length - 1 ? (
              <>
                {item.path ? (
                  <Link 
                    to={item.path} 
                    className="hover:text-neon-accent transition-colors duration-300"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span>{item.label}</span>
                )}
                <span className="mx-2">&gt;</span>
              </>
            ) : (
              <span className="text-neon-accent font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;