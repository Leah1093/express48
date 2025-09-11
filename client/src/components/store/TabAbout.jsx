import React from 'react';

const TabAbout = ({ store }) => {
  const about = store?.about;
  if (!(about?.showAbout && about?.text)) {
    return (
      <div id="about" className="bg-gray-50 border rounded-lg px-4 py-6 text-sm text-gray-600">
        עדיין אין מידע על החנות.
      </div>
    );
  }
  return (
    <div id="about" className="bg-white border rounded-lg px-4 py-6 leading-7">
      {about.text}
    </div>
  );
};

export default TabAbout;
