import styled from "styled-components";

export const Input = styled.input`
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`

export const TextArea = styled.textarea`
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-height: 200px;
`

export const Select = styled.select`
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

export const Select2 = styled.select`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

export const MultiSelect = styled.div`
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
`

export const PaginationButton = styled.div`
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  align-items: center;
  cursor: pointer;

  @media (max-width: 768px) {
    width: 100%;
  }
`

export const Button = styled.button`
padding: 0.5rem 1rem;
border-radius: 0.375rem;  /* Rounded-md */
font-size: 0.8rem;
font-weight: 400;
cursor: pointer;
transition: background-color 0.3s, color 0.3s;

&:hover {
  opacity: 0.9;
}
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const GridContainer12 = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 0.5rem; /* Tailwind's gap-2 corresponds to 0.5rem */

  @media (min-width: 768px) {
    grid-template-columns: repeat(12, 1fr);
  }
`

export const ColSpan2 = styled.div`
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`