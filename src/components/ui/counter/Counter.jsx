import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import "./Counter.css";

function Number({ mv, number, height }) {
  let y = useTransform(mv, (latest) => {
    let placeValue = latest % 10;
    let offset = (10 + number - placeValue) % 10;
    let memo = offset * height;
    if (offset > 5) {
      memo -= 10 * height;
    }
    return memo;
  });

  return (
    <motion.span className="counter-number" style={{ y }}>
      {number}
    </motion.span>
  );
}

function Digit({ place, value, height, digitStyle }) {
  let valueRoundedToPlace = Math.floor(value / place);
  let animatedValue = useSpring(valueRoundedToPlace);

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, valueRoundedToPlace]);

  return (
    <div className="counter-digit" style={{ height, ...digitStyle }}>
      {Array.from({ length: 10 }, (_, i) => (
        <Number key={i} mv={animatedValue} number={i} height={height} />
      ))}
    </div>
  );
}

export default function Counter({
  value,
  fontSize = 100,
  padding = 0,
  places = [100, 10, 1],
  gap = 8,
  borderRadius = 4,
  horizontalPadding = 8,
  textColor = "white",
  fontWeight = "bold",
  containerStyle,
  counterStyle,
  digitStyle,
  gradientHeight = 16,
  gradientFrom = "rgba(255, 255, 255, 0.1)",
  gradientTo = "transparent",
  topGradientStyle,
  bottomGradientStyle,
  theme = "transparent",
  size = "medium",
  className = "",
  minimal = false,
  bootstrapClass = "",
}) {
  const height = fontSize + padding;

  // If minimal mode, just render the number without animation
  if (minimal) {
    return (
      <span className={`${bootstrapClass} ${className}`} style={containerStyle}>
        {value}
      </span>
    );
  }

  // Size configurations
  const sizeConfigs = {
    small: { fontSize: 14, padding: 2, horizontalPadding: 4, gap: 2 },
    medium: { fontSize: 18, padding: 4, horizontalPadding: 6, gap: 4 },
    large: { fontSize: 24, padding: 6, horizontalPadding: 8, gap: 6 },
    xl: { fontSize: 32, padding: 8, horizontalPadding: 10, gap: 8 },
    custom: { fontSize, padding, horizontalPadding, gap }
  };

  const config = sizeConfigs[size] || sizeConfigs.medium;

  const defaultCounterStyle = {
    fontSize: config.fontSize,
    gap: config.gap,
    borderRadius,
    paddingLeft: config.horizontalPadding,
    paddingRight: config.horizontalPadding,
    paddingTop: config.padding,
    paddingBottom: config.padding,
    color: textColor,
    fontWeight,
  };

  const defaultTopGradientStyle = {
    height: gradientHeight,
    background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})`,
  };

  const defaultBottomGradientStyle = {
    height: gradientHeight,
    background: `linear-gradient(to top, rgba(0, 0, 0, 0.1), ${gradientTo})`,
  };

  const counterClasses = [
    'counter-counter',
    `counter-${theme}`,
    `counter-${size}`,
    bootstrapClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="counter-container" style={containerStyle}>
      <div
        className={counterClasses}
        style={{ ...defaultCounterStyle, ...counterStyle }}
      >
        {places.map((place) => (
          <Digit
            key={place}
            place={place}
            value={value}
            height={config.fontSize + config.padding}
            digitStyle={digitStyle}
          />
        ))}
      </div>

      {theme !== 'transparent' && (
        <div className="gradient-container">
          <div
            className="top-gradient"
            style={topGradientStyle || defaultTopGradientStyle}
          ></div>
          <div
            className="bottom-gradient"
            style={bottomGradientStyle || defaultBottomGradientStyle}
          ></div>
        </div>
      )}
    </div>
  );
}
