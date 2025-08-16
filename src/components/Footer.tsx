import React from 'react';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerNavigation = {
    main: [
      { name: 'Events', href: '/events' },
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-8 lg:py-12">
          {/* Main footer content */}
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            {/* Logo and description */}
            <div className="space-y-4 xl:col-span-1">
              <Link 
                href="/events" 
                className="text-lg font-bold text-gray-900 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded transition-colors"
              >
                TicketTock
              </Link>
              <p className="text-sm text-gray-600 max-w-md">
                Your go-to platform for discovering and booking amazing events. 
                Find concerts, conferences, workshops, and more in your area.
              </p>
            </div>

            {/* Navigation links */}
            <div className="mt-8 xl:mt-0 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                {/* Main navigation */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                    Platform
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {footerNavigation.main.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="text-sm text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded transition-colors"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Legal links */}
                <div className="mt-8 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                    Legal
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {footerNavigation.legal.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="text-sm text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded transition-colors"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom section */}
          <div className="mt-8 pt-8 border-t border-gray-200 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              {/* Social links placeholder - can be expanded later */}
              <p className="text-xs text-gray-400 hidden md:block">
                Follow us for updates
              </p>
            </div>
            
            {/* Copyright */}
            <p className="mt-4 text-sm text-gray-500 md:mt-0 md:order-1">
              © {currentYear} TicketTock. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
