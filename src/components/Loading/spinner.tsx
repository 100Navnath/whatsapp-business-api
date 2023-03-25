import { CircularProgress } from '@material-ui/core';
import { Color } from '@mui/material';
import { CSSProperties } from '@mui/material/styles/createMixins';
import { StyleOptions } from '@mui/system';
interface spinnerInterface {
    color?: string,
    style?: CSSProperties
}
export default function Spinner({ color = "#FFF", style = {} }: spinnerInterface) {
    return (
        <CircularProgress size={16} style={{ color: color, ...style }} />
    )
}
