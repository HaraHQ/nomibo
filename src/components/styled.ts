import styled from "styled-components";

export const Input = styled.input`
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`

export const Select = styled.select`
  padding: 0.5rem;
  margin-bottom: 1rem;
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