import { FC, useState } from "react";
import { PiArrowBendRightDownFill, PiShieldChevron, PiShieldStar, PiShippingContainer, PiShippingContainerFill, PiShirtFolded, PiShootingStarFill, PiShrimp, PiSneakerDuotone, PiStethoscopeDuotone } from "react-icons/pi";
import { MultiSelect } from "./styled";
import styled from "styled-components";

const OuterDiv = styled.div`
  position: absolute;
  top: 80%;
  z-index: 100;
`;

const InnerDiv = styled.div`
  background: white;
  border: 1px solid #737373;
  border-radius: 0.5rem;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  width: 300px;
  gap: 4px;
  font-size: 12px;
`;

const features = [
  {
    i: <PiShieldStar />,
    n: 'New'
  },
  {
    i: <PiShieldChevron />,
    n: 'Secondhand'
  },
  {
    i: <PiShirtFolded />,
    n: 'Clothes'
  },
  {
    i: <PiShrimp />,
    n: 'Seafood'
  },
  {
    i: <PiShippingContainerFill />,
    n: 'Flash Sale'
  },
  {
    i: <PiShootingStarFill />,
    n: 'Discount'
  },
  {
    i: <PiSneakerDuotone />,
    n: 'Shoes'
  },
  {
    i: <PiStethoscopeDuotone />,
    n: 'Health Device'
  },
]

const MultiSelector: FC = () => {
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelect = (item: string) => {
    if (selected.includes(item)) {
      // If the item is already selected, remove it from the selected array
      setSelected(selected.filter((i) => i !== item));
    } else {
      // If the item is not selected, add it to the selected array
      setSelected([...selected, item]);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <MultiSelect onClick={() => setShow(!show)}>
        <span>Select</span>
        <PiArrowBendRightDownFill />
      </MultiSelect>
      {show && (
        <OuterDiv>
          <InnerDiv>
            {features.map((item) => (
              <div
                key={item.n}
                onClick={() => handleSelect(item.n)}
                style={{
                  padding: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: selected.includes(item.n) ? 'red' : 'lightgray',
                  color: selected.includes(item.n) ? 'white' : 'black',
                }}
              >
                {item.i} {item.n}
              </div>
            ))}
          </InnerDiv>
        </OuterDiv>
      )}
    </div>
  );
};

export default MultiSelector