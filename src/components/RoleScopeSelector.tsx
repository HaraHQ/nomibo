import { FC } from "react"
import { GridContainer12, Button } from "./styled"

type ScopeSelector = {
  selected: string[]
  setSelected: (value: string[]) => void
}

const RoleScopeSelector: FC<ScopeSelector> = ({ selected, setSelected }) => {
  const handleSelected = (value: string) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((item) => item !== value))
    } else {
      setSelected([...selected, value])
    }
  }
  return (
    <>
      <div style={{ color: 'darkred', fontSize: 12 }}>{selected.join(', ')}</div>
      <GridContainer12>
        <Button
          onClick={() => handleSelected('users')}
          style={selected.includes('users') ? { backgroundColor: 'white' } : {}}
        >
          Users
        </Button>
        <Button
          onClick={() => handleSelected('user-roles')}
          style={selected.includes('user-roles') ? { backgroundColor: 'white' } : {}}
        >
          Roles
        </Button>
        <Button
          onClick={() => handleSelected('products')}
          style={selected.includes('products') ? { backgroundColor: 'white' } : {}}
        >
          Products
        </Button>
        <Button
          onClick={() => handleSelected('orders')}
          style={selected.includes('orders') ? { backgroundColor: 'white' } : {}}
        >
          Orders
        </Button>
      </GridContainer12>
    </>
  )
}

export default RoleScopeSelector