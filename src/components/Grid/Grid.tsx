import { ReactElement, useState, useEffect, useRef } from 'react'
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled, Checkbox, Skeleton } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import './grid.css'
import { AnimatedList } from 'react-animated-list';
import { FirstPageOutlined, SearchOutlined, KeyboardArrowLeft, KeyboardArrowRight, LastPageOutlined, Clear, Height, ArrowForward } from '@material-ui/icons';
import InputAdornment from '@mui/material/InputAdornment';
import { Button } from '@material-ui/core';
import { ValidateEmptyField } from '../validators';
import { API } from '../../constant/network';
import OutlinedInput from '@mui/material/OutlinedInput';
import Toast from '../Toast/Toast';
import Spinner from '../Loading/spinner';
import InfiniteScroll from 'react-infinite-scroller';
import Popup from 'reactjs-popup';
import Scrollbars from 'react-custom-scrollbars';
import { gender } from '../../assets/dropdownData/gender';
import Dropdown from '../Dropdown';
import { DateRangePicker, DateRange } from "materialui-daterange-picker";
import Dialog from '../Dialog/Dialog';
import moment from 'moment';

interface Action {
    component: ReactElement | ((index: number) => ReactElement),
    tooltip?: ((index: number) => String) | String,
    // tooltip?: any,
    onClick?: any,
}
interface ToolbarAction {
    component: ReactElement,
    tooltip?: String,
    onClick?: any,
}

interface Column {
    header: any,
    value: string | ReactElement | ((column: any, index: number) => ReactElement),
    isDisabled?: boolean,
    propertyName?: string,
    width?: number
    charLimit?: number
    expanded?: boolean
    popupOnHover?: boolean
    columnSearch?: {
        options?: Array<any>,
        type?: 'daterange' | 'dropdown' | 'none' | 'text'
    }
}

interface GridProps {
    columns: Array<Column>,
    data: Array<any>,
    totalCount?: number,
    pagination?: boolean,
    rowsAtATime?: number,
    columnWidth?: number,
    isActions?: boolean,
    actions?: Array<Action>
    toolbarButtons?: Array<ToolbarAction> | any
    footer?: boolean
    setSelectedRows?: (rows: any) => void;
    rowsAtATimeSelector?: boolean,
    loading?: boolean
    columnSearch?: boolean
    globalSearch?: boolean
    onPageChange?: (take: number, skip: number, searchValue: string) => void
    onGlobalSearch?: (take: number, skip: number, searchValue: string) => void
    onColumnSearch?: (take: number, skip: number, columnSearch: Object) => void
    api?: { url: string, body: Object, listFieldName: string, countFieldName?: string }
    selectedRecords?: Array<any>
    title?: string
    acquireFullWidth?: boolean
    setFilters?: (filters: object) => void
    infiniteScroll?: boolean
    clickToExpand?: boolean
    horizontalScroll?: boolean
    setColumnSearch?: Object
}

export default function Grid({ columns, data = [], rowsAtATime = 10, columnWidth = 100, isActions = false,
    actions = [], toolbarButtons = [], pagination = false, footer = true, setSelectedRows,
    rowsAtATimeSelector = false, loading = false, columnSearch = true, globalSearch = true, onPageChange,
    totalCount = 0, onGlobalSearch, api, onColumnSearch, selectedRecords = [], title = '',
    acquireFullWidth = false, setFilters, infiniteScroll = false, clickToExpand = false, horizontalScroll = false,
    setColumnSearch
}: GridProps) {

    const GridTooltip = styled(({ className, ...props }: any) => (
        <Tooltip {...props} classes={{ popper: className }} />
    ))(({ theme }) => ({
        [`& .${tooltipClasses.tooltip}`]: {
            backgroundColor: '#111',
            color: '#FFF',
            maxWidth: 220,
            fontSize: theme.typography.pxToRem(10),
            border: '1px solid #dadde9',
        },
    }));

    const [isAssignExistsInData, setIsAssignExistsInData] = useState<undefined | boolean>(false);
    const [rowsAtOnce, setRowsAtOnce] = useState<number>(rowsAtATime);
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState<any>(Object);
    const [selected, setSelected] = useState<Array<any>>(selectedRecords);
    const [globalSearchValue, setGlobalSearchValue] = useState("")
    const [expanedIndex, setExpanedIndex] = useState(-1)
    const [showPopupIndex, setShowPopupIndex] = useState({ columnIndex: -1, dataIndex: -1 });
    const [daterangePicker, setDaterangePicker] = useState(false);
    const [daterange, setDaterange] = useState({})
    function onChangeColumnSearch(event: any, index: any) {
        const fieldName = typeof columns[index].value === 'string' ? columns[index].value : columns[index].propertyName && typeof columns[index].propertyName === 'string' ? columns[index].propertyName : "propertyNameNotDefined"
        setSearch({ ...search, [`${[fieldName]}`]: event.target.value });
        if (event.target.value.length > 2) {
            setPage(1);
            onColumnSearch && onColumnSearch(rowsAtOnce, 0, { ...search, [`${[fieldName]}`]: event.target.value })
        } else if (event.target.value.length === 0) {
            onPageChange && onPageChange(rowsAtOnce, (page - 1) * rowsAtOnce, globalSearchValue);
        }
    }
    // useEffect(() => {
    //     console.log("Column search : ", search);
    // }, [search])

    //search pattern
    // {
    //     0: 'keyword',
    //     1: 'keyword'
    // }

    const [sort, setSort] = useState<any>();
    const [recentSortColumn, setRecentSortColumn] = useState<any>();
    function onChangeColumnSort(index: any) {
        setSort({ ...sort, [columns[index].header]: sort && typeof sort[columns[index].header] == 'boolean' ? !sort[columns[index].header] : false });
        setRecentSortColumn(columns[index].header);
    }
    //search pattern
    // {
    //     0: 'asc',
    //     1: 'desc'
    // }

    useEffect(() => {
        function isAssignExists() {
            if (data && typeof data[0] === "object") {
                var keys = Object.keys(data[0]);
                var isExist = false

                for (let i = 0; i < keys.length; i++) {
                    if (keys[i] === "isAssigned") {
                        setIsAssignExistsInData(true);
                        break
                    }
                }
                return isExist
            }
        }
        isAssignExists()
    }, [setSelectedRows])

    useEffect(() => {
        function resetColumnSearch() {
            setSearch(setColumnSearch);
        }
        resetColumnSearch();
    }, [setColumnSearch])


    // useEffect(() => {
    //     if (!isApiHit && rowsAtOnce !== 0) {
    //         onPageChange && onPageChange(rowsAtOnce, (page - 1) * rowsAtOnce, globalSearchValue);
    //         setIsApiHit(true);
    //     }
    // }, [rowsAtOnce])

    function onRowClick(row: any, index: number, add: boolean | undefined) {
        function addAsSelected() {
            setSelected([...selected, row])
        }
        function removeFromSelected() {
            const newArray = selected.filter((item) => item.id !== row.id)
            setSelected([...newArray])
        }
        if (setSelectedRows) {
            if (isAssignExistsInData) {
                let isChecked = false
                for (let i = 0; i < selected.length; i++) {
                    if (selected[i].id === row.id) {
                        isChecked = true
                    }
                }
                if (!isChecked) setSelected([...selected, { ...data[index], isAssigned: true }])
                else {
                    let newArr = [...selected]; // copying the old array
                    const i = newArr.findIndex(obj => obj.id === row.id); //get index if object in array
                    newArr[i] = { ...newArr[i], isAssigned: !newArr[i].isAssigned }; // replace value with whatever you want to change it to
                    setSelected([...newArr])
                }
            }
            else {
                if (typeof add === "boolean") {
                    if (add) {
                        //add object in selected
                        addAsSelected()
                    } else {
                        //remove object from selected
                        removeFromSelected()
                    }
                } else {
                    let isChecked = false
                    for (let i = 0; i < selected.length; i++) {
                        if (selected[i].id === row.id) {
                            isChecked = true
                            break
                        }
                    }
                    if (!isChecked) {
                        //add object
                        addAsSelected()
                    }
                    else {
                        // remove object
                        removeFromSelected()
                    }
                }
            }
        }
    }

    useEffect(() => {
        if (setSelectedRows && data[0] && typeof data[0].isAssigned === 'boolean') {
            const selectedRows = data.filter((i) => i.isAssigned === true);
            const combineArray = [...selectedRows, ...selectedRecords];
            const uniqueIds: Array<any> = [];
            const unique = combineArray.filter((element: any) => {
                const isDuplicate = uniqueIds.includes(element.id);

                if (!isDuplicate) {
                    uniqueIds.push(element.id);
                    return true;
                }

                return false;
            });
            setSelected(unique);
        }
    }, [data])

    useEffect(() => {
        if (setSelectedRows) {
            setSelectedRows([...selected]);
        }
    }, [selected])

    function selectAll(checked: boolean) {
        let allData: Array<any> = [...data];
        try {
            if (api && api?.url && api?.body && api.listFieldName && checked) {
                if (globalSearchValue === "") {
                    API.get(`${api?.url}`, { ...api?.body, take: totalCount, skip: 0, searchValue: globalSearchValue }, {})?.subscribe({
                        next(res: any) {
                            if (res.status === 200) {
                                allData = res.data[`${api?.listFieldName}`];
                                setSelectedData()
                            }
                        },
                        error(err) {
                            alert(err);
                        },
                    });
                } else if (globalSearchValue) {
                    API.get(`${api?.url} `, { ...api?.body, take: totalCount, skip: 0, searchValue: globalSearchValue }, {})?.subscribe({
                        next(res: any) {
                            if (res.status === 200) {
                                allData = res.data[`${api?.listFieldName}`];
                                setSelectedData()
                            }
                        },
                        error(err) {
                            alert(err);
                        },
                    });
                }
            } else setSelectedData();
        } catch (error) {
            alert(error)
        }
        function setSelectedData() {
            if (isAssignExistsInData) {
                if (setSelectedRows) {
                    // console.log("checked : ", checked);
                    if (checked) {
                        let newArr = allData;
                        for (let i = 0; i < allData.length; i++) {
                            newArr[i].isAssigned = true
                        }
                        setSelected([...newArr, ...selectedRecords]);
                    }
                    else {
                        let newArr = allData;
                        for (let i = 0; i < allData.length; i++) {
                            newArr[i].isAssigned = false
                        }
                        setSelected([...newArr, ...selectedRecords]);
                    }
                }
            } else {
                if (checked) setSelected([...allData, ...selectedRecords])
                else setSelected([])
            }
        }
    }

    const lastPage = Math.floor(totalCount / rowsAtOnce) + ((totalCount / rowsAtOnce) % 1 === 0 ? 0 : 1);
    function getPagesArray() {
        const pageArr: Array<number> = Array.from({ length: (Math.floor(totalCount / rowsAtOnce) + ((totalCount / rowsAtOnce) % 1 === 0 ? 0 : 1)) }, (x, i) => i + 1)
        if (pageArr.length >= 5) {
            if (page === 1 || page === 2) return pageArr.slice(0, 5)
            else if (page === lastPage - 1) return pageArr.slice((pageArr.length - 5), pageArr.length)
            else if (page === (lastPage - 1)) return pageArr.slice((pageArr.length - 6), pageArr.length - 1)
            else if (page === lastPage) return pageArr.slice((pageArr.length - 5), pageArr.length)
            else return pageArr.slice((page - 3), page + 2)
        } else {
            return pageArr
        }
    }

    function isAssignedRows() {
        let isAssigned: Array<any> = [];
        for (let i = 0; i < data.length; i++) {
            if (data[i].isAssigned) isAssigned.push(data[i]);
        }
        return isAssigned
    }

    const footerRef = useRef<any>(null);

    return (
        <div id='grid'>
            {(toolbarButtons.length > 0 || title || globalSearch) &&
                <div className='grid-toolbar'>
                    <span className='title'>{title}</span>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {
                            toolbarButtons.map((action: any, index: number) =>
                                <GridTooltip title={toolbarButtons[index].tooltip} placement="bottom">
                                    <Button className='toolbar-btn' onClick={action.onClick}>
                                        {action.component}
                                    </Button>
                                </GridTooltip>
                            )
                        }
                        {globalSearch &&
                            <div className="global-search">
                                <OutlinedInput
                                    label={false}
                                    className="global-search-input"
                                    type={"text"}
                                    value={globalSearchValue}
                                    onChange={(e) => {
                                        setGlobalSearchValue(e.target.value)
                                        if (e.target.value.length === 0) {
                                            onPageChange && onPageChange(rowsAtOnce, 0, "")
                                        }
                                    }}
                                    endAdornment={
                                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <InputAdornment position="end">
                                                <IconButton
                                                    className="global-search-clear-input-icon"
                                                    onClick={() => {
                                                        setGlobalSearchValue("")
                                                        onPageChange && onPageChange(rowsAtOnce, 0, "")
                                                    }}
                                                >
                                                    <Clear style={{ fontSize: 16 }} />
                                                </IconButton>
                                            </InputAdornment>
                                            <IconButton className='search-btn global-search-button-icon' onClick={() => {
                                                if (globalSearchValue.length >= 3) {
                                                    Object.keys(search).forEach((k: string) => search[`${k}`] = "");
                                                    onPageChange && onPageChange(rowsAtOnce, 0, globalSearchValue)
                                                } else Toast({ message: 'Search Value must contain atleast 3 characters', type: 'warning' })
                                            }
                                            }><SearchOutlined /></IconButton>
                                        </span>

                                    }
                                />
                            </div>
                        }
                    </span>
                </div>}
            {/* footer dynamic height:(footerRef && footerRef.current && footerRef.current.clientHeight) */}
            <Scrollbars className='grid-wrapper' style={{
                height: (36 * rowsAtOnce) + 47 + 47, width: horizontalScroll ? 880 : "100%", paddingBottom: 15
            }}>
                <div className='grid-wrapper'>
                    <div className='grid-header-wrapper'>
                        {
                            setSelectedRows &&
                            <Checkbox
                                className='checkbox'
                                size='small'
                                checked={isAssignExistsInData ? isAssignedRows().length === totalCount : selected.length === totalCount}
                                onChange={(e) => { selectAll(e.target.checked) }}
                                onKeyDown={(e) => e.key === "Enter" && e.target.click()}
                            />
                        }
                        {
                            columns.map((i, index) =>
                                <div className='header' style={{ width: i.width ? i.width : columnWidth }}>
                                    <span className='pointer' onClick={() => onChangeColumnSort(index)}>
                                        {i.header}
                                        {/* <KeyboardArrowDown className={sort && sort[columns[index].header] ? 'down-arrow' : ''} style={{ fontSize: 18 }} /> */}
                                    </span>
                                </div>
                            )
                        }
                        {isActions && <div className='header'>Action</div>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {
                            columnSearch &&
                            <div className='row-wrapper'>
                                {
                                    setSelectedRows &&
                                    <span className='checkbox' />
                                }
                                {
                                    columns.map((i: any, index: any) => {
                                        const fieldName = typeof columns[index].value === 'string' ? columns[index].value : columns[index].propertyName ? columns[index].propertyName : "propertyNameNotDefined"
                                        return <div className='grid-row-block column-search-row' style={{ width: i.width ? i.width : columnWidth }}>
                                            {i.columnSearch && i.columnSearch.options ?
                                                <Dropdown
                                                    options={gender}
                                                    styles={{ height: 25, width: i.width ? i.width - 20 : 100 }}
                                                    inputWrapper={{ height: 25, width: i.width ? i.width - 20 : 100 }}
                                                    inputStyles={{ outline: 0, width: i.width ? i.width - 20 : 100, borderWidth: '0 0 1px', height: 25, minHeight: 25 }}
                                                    optionsContainer={{ width: i.width ? i.width : 100 }}
                                                    defaultValue={search && search[i.propertyName]}
                                                    placeholder={`Select ${i.propertyName}`}
                                                    scrollbarHeight={150}
                                                    onChange={function (e: any) {
                                                        // setNewContact({ ...newContact, gender: e });
                                                        onChangeColumnSearch({ target: { value: e } }, index);
                                                    }}
                                                /> :
                                                i?.columnSearch?.type === 'daterange' ?
                                                    <span onClick={() => setDaterangePicker(true)} style={{ fontSize: 10, cursor: 'pointer' }}>
                                                        {search && search[i.propertyName] && search[i.propertyName].from ? moment(search[i.propertyName].from).format('MM/DD/YYYY') : 'Start date'}
                                                        <ArrowForward fontSize='small' style={{ fontSize: 10 }} /> <br />
                                                        {search && search[i.propertyName] && search[i.propertyName].to ? moment(search[i.propertyName].to).format('MM/DD/YYYY') : 'End date'}
                                                    </span>
                                                    :
                                                    i?.columnSearch?.type !== "none" && <Input
                                                        id="standard-adornment-amount"
                                                        className='search-input '
                                                        style={{ width: i.width ? i.width - 20 : columnWidth - 20, fontSize: 12 }}
                                                        placeholder={"Min. 3 chars"}
                                                        value={search && search[`${fieldName}`] ? search[`${fieldName}`] : ""}
                                                        onChange={(event) => onChangeColumnSearch(event, index)}
                                                        startAdornment={<InputAdornment position="start" ><SearchOutlined style={{ fontSize: 14 }} /></InputAdornment>}
                                                    />
                                            }
                                        </div>
                                    }
                                    )
                                }
                                {
                                    isActions && actions.length != 0 &&
                                    < div className='grid-row-block' style={{ width: columnWidth }} />
                                }
                            </div>
                        }
                        {
                            data.length != 0 && !loading ?
                                <AnimatedList animation={"zoom"} >
                                    {
                                        data.slice(0, infiniteScroll ? data.length : rowsAtOnce).map((row: any, dataIndex: number) => {
                                            const indexInSeleced = selected.findIndex(obj => obj.id === row.id)
                                            let isAssigned = false
                                            if (isAssignExistsInData) {
                                                isAssigned = selected[indexInSeleced] && typeof selected[indexInSeleced].isAssigned === 'boolean' ? selected[indexInSeleced].isAssigned : false
                                            } else isAssigned = indexInSeleced >= 0 ? true : false
                                            return (
                                                <div className='row-wrapper' style={{ cursor: setSelectedRows || clickToExpand ? "pointer" : 'default', color: (row.isDisabled || row.isBlock) && '#bdbdbd' }} onClick={(e) => {
                                                    e.stopPropagation();
                                                    onRowClick(row, dataIndex, undefined)
                                                    clickToExpand && setExpanedIndex(expanedIndex === dataIndex ? -1 : dataIndex)
                                                }
                                                }>
                                                    {
                                                        setSelectedRows &&
                                                        <span onClick={(e) =>
                                                            e.stopPropagation()
                                                        }>
                                                            <Checkbox
                                                                className='checkbox'
                                                                size='small'
                                                                checked={isAssigned}
                                                                onChange={(e) => {
                                                                    e.stopPropagation()
                                                                    onRowClick(row, dataIndex, e.target.checked);
                                                                }}
                                                                onKeyDown={(e) => e.key === "Enter" && e.target.click()}
                                                            />
                                                        </span>
                                                    }
                                                    {
                                                        // { header: 'Name', value: 'name' },
                                                        columns.map((column: any, index: any) =>
                                                            <div
                                                                style={{
                                                                    width: column.width ? column.width : columnWidth,
                                                                    whiteSpace: expanedIndex === dataIndex ? 'pre-wrap' : 'nowrap'
                                                                }}
                                                                className={column.popupOnHover ? 'show-full-text grid-row-block' : 'grid-row-block'}
                                                                data-text={
                                                                    typeof column.value == 'string' ?
                                                                        `${data[dataIndex][column.value]}` :
                                                                        typeof column.value == 'function' && column.value(row, dataIndex)
                                                                } >
                                                                {
                                                                    typeof column.value == 'string' ?
                                                                        data[dataIndex][column.value] && !ValidateEmptyField(`${data[dataIndex][column.value]}`).isError ?
                                                                            `${data[dataIndex][column.value]}` : "NA" :
                                                                        typeof column.value == 'function' ? column.value(row, dataIndex) : column.value
                                                                }
                                                            </div>
                                                        )
                                                    }
                                                    {
                                                        isActions &&
                                                        <div className='grid-actions-column grid-row-block'>
                                                            {
                                                                actions.map((item, index) =>
                                                                    item.tooltip ?
                                                                        <GridTooltip title={typeof item.tooltip === 'function' ? item.tooltip(dataIndex) : item.tooltip} placement="bottom">
                                                                            <span onClick={() => {
                                                                                actions[index].onClick(row.id, dataIndex);
                                                                            }}>
                                                                                {
                                                                                    typeof item.component === 'function' ? item.component(dataIndex) : item.component
                                                                                }
                                                                            </span>
                                                                        </GridTooltip> :
                                                                        <span onClick={() => {
                                                                            actions[index].onClick(row.id, dataIndex);
                                                                        }}>
                                                                            {
                                                                                typeof item.component === 'function' ? item.component(dataIndex) : item.component
                                                                            }
                                                                        </span>
                                                                )
                                                            }
                                                        </div>
                                                    }
                                                </div>)
                                        }
                                        )
                                    }
                                </AnimatedList>
                                :
                                !loading ?
                                    <div className='row-wrapper' style={{ fontSize: 12 }}>Data not found</div> :
                                    Array(rowsAtOnce).fill(null).map(() =>
                                        < div className='row-wrapper' style={{ cursor: setSelectedRows ? "pointer" : 'default' }}>
                                            {
                                                setSelectedRows &&
                                                <Skeleton
                                                    className='checkbox'
                                                    variant='rectangular'
                                                    style={{ width: 20, height: 20, borderRadius: 3 }}
                                                />
                                            }
                                            {
                                                columns.map((column: any, index: any) =>
                                                    <div className='grid-row-block' style={{ width: column.width ? column.width : columnWidth }}>
                                                        <Skeleton
                                                            className='grid-row-block'
                                                            variant='text' sx={{ fontSize: 12 }}
                                                            style={{ width: column.width ? column.width : columnWidth }}
                                                        />
                                                    </div>
                                                )
                                            }
                                        </div>
                                    )
                        }
                    </div>
                </div>
            </Scrollbars >
            {
                footer &&
                <div ref={footerRef} className='grid-footer'>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        {
                            rowsAtATimeSelector &&
                            [5, 10, 20, 50, 100].map((i, index, arr) =>
                                totalCount > (index > 0 && arr[index - 1]) &&
                                <div
                                    onClick={() => {
                                        onPageChange && onPageChange(rowsAtOnce, 0, globalSearchValue);
                                        setPage(1);
                                        setRowsAtOnce(i)
                                    }}
                                    className={i == rowsAtOnce ? 'page-number-wrapper active' : 'page-number-wrapper'}><div className='page-number'>{i}</div>
                                </div>
                            )
                        }
                    </div>
                    {
                        // pagination && rowsAtOnce <= totalCount &&
                        pagination && (rowsAtOnce <= totalCount) &&
                        <div className='pagination-wrapper'>
                            <div style={{ fontSize: 10 }}>Showing {page * rowsAtOnce > totalCount ? `${(page * rowsAtOnce) - rowsAtOnce + 1} -${totalCount} ` : `${((page - 1) * rowsAtOnce) + 1} -${page * rowsAtOnce} `}  of {totalCount}</div>
                            <IconButton>
                                <GridTooltip title="First Page" placement="bottom"><FirstPageOutlined onClick={() => {
                                    if (page !== 1) {
                                        onPageChange && onPageChange(rowsAtOnce, 0, globalSearchValue);
                                        setPage(1);
                                    }
                                }} className='page-icon' /></GridTooltip></IconButton>
                            <IconButton>
                                <GridTooltip title="Previous" placement="bottom"><KeyboardArrowLeft onClick={() => {
                                    if (page >= 2) {
                                        onPageChange && onPageChange(rowsAtOnce, (page - 1) * rowsAtOnce, globalSearchValue)
                                        setPage(page - 1);
                                    }
                                }} className='page-icon' /></GridTooltip></IconButton>
                            {
                                // Array.from({ length: (Math.floor(totalCount / rowsAtOnce) + 1) }, (x, i) => i + 1).map((pageNo) =>
                                getPagesArray().map((pageNo) =>
                                    <IconButton>
                                        <div onClick={() => {
                                            setPage(pageNo);
                                            onPageChange && onPageChange(rowsAtOnce, (pageNo - 1) * rowsAtOnce, globalSearchValue)
                                        }} className={page == pageNo ? 'page-number-wrapper active' : 'page-number-wrapper'}><div className='page-number'>{pageNo}</div>
                                        </div>
                                    </IconButton>
                                )
                            }
                            <IconButton>
                                <GridTooltip title="Next" placement="bottom"><KeyboardArrowRight onClick={() => {
                                    if (page < getPagesArray().length) {
                                        onPageChange && onPageChange(rowsAtOnce, (page) * rowsAtOnce, globalSearchValue)
                                        setPage(page + 1);
                                    }
                                }} className='page-icon' /></GridTooltip></IconButton>
                            <IconButton><GridTooltip title="Last" placement="bottom"><LastPageOutlined onClick={() => {
                                if (page !== getPagesArray()[getPagesArray().length - 1]) {
                                    onPageChange && onPageChange(rowsAtOnce, (lastPage - 1) * rowsAtOnce, globalSearchValue)
                                    setPage(lastPage)
                                }
                            }} className='page-icon' /></GridTooltip></IconButton>
                        </div>
                    }
                </div >
            }
            <Dialog
                title={"Select From and To date"}
                open={daterangePicker}
                onClose={() => setDaterangePicker(false)}
                onClick={() => {
                    setSearch({ ...search, dob: daterange })
                    setDaterangePicker(false);
                    setPage(1);
                    onColumnSearch && onColumnSearch(rowsAtOnce, 0, { ...search, dob: daterange })
                }}
                loading={false}
                DialogBody={() =>
                    <div style={{ padding: 0 }}>
                        <DateRangePicker
                            open={true}
                            toggle={() => setDaterangePicker(!daterangePicker)}
                            onChange={(range) => setDaterange({
                                "from": moment(range.startDate).format('YYYY/MM/DD'),
                                "to": moment(range.endDate).format('YYYY/MM/DD')
                            })}
                        />
                    </div>}
                positiveBtnLabel={"Submit"}
            />
        </div >
    )
}
