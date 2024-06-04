import React from 'react';

const Services = () => {
  return (
    <div className="pt-28 px-4 md:px-6 md:pt-20 pb-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-semibold text-zinc-600 mb-6">Our Services</h1>
        <p className="text-gray-600 mb-8">We offer a wide range of healthcare services to meet your needs.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 border rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-zinc-600">Primary Care</h2>
            <p className="text-gray-600 mt-2">Our primary care physicians are here to provide comprehensive and preventive healthcare services for you and your family.</p>
          </div>

          <div className="p-6 border rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-zinc-600">Specialty Care</h2>
            <p className="text-gray-600 mt-2">We have a team of specialists to address specific healthcare needs, from cardiology to orthopedics.</p>
          </div>

          <div className="p-6 border rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-zinc-600">Emergency Care</h2>
            <p className="text-gray-600 mt-2">Our emergency department is open 24/7 to provide immediate medical attention in critical situations.</p>
          </div>

          <div className="p-6 border rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-zinc-600">Mental Health</h2>
            <p className="text-gray-600 mt-2">We prioritize mental health and offer counseling and therapy services to support your emotional well-being.</p>
          </div>

          {/* Add more services as needed */}
        </div>
      </div>
    </div>
  );
};

export default Services;
