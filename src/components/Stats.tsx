
const Stats = () => {
  const stats = [
    { number: "50K+", label: "Happy Customers" },
    { number: "2M+", label: "Products Curated" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "AI Support" }
  ];

  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-gray-400 text-lg">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
