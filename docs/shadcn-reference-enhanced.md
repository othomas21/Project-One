# shadcn/ui Enhanced Reference for Claude Code

## Overview
shadcn/ui is a beautifully-designed component system built on Radix UI and Tailwind CSS. Unlike traditional component libraries, shadcn/ui provides **copy-and-paste components** that you own and can customize completely. This reference provides comprehensive guidelines for using shadcn/ui effectively within the Claude Code development standards.

**@reftools Always verify shadcn/ui component APIs and patterns at https://ui.shadcn.com**

## 🔌 SHADCN MCP (MODEL CONTEXT PROTOCOL) INTEGRATION

### What is shadcn MCP?
shadcn MCP servers provide AI assistants like Claude Code with real-time access to shadcn/ui v4 components, blocks, demos, and metadata directly from the official repository. Instead of relying on potentially outdated training data, you can fetch the latest component implementations, ensuring accuracy and current best practices.

### Key Benefits
- **Always Current**: Access to the latest shadcn/ui v4 components and patterns
- **Complete Context**: Component source code, demos, dependencies, and metadata
- **Blocks Support**: Pre-built dashboard, calendar, login forms, and complex layouts
- **Framework Support**: Both React (shadcn/ui) and Svelte (shadcn-svelte) implementations
- **Rate Limit Management**: Efficient caching and GitHub API integration

### Available MCP Servers

#### Recommended Servers
1. **@jpisnice/shadcn-ui-mcp-server** (Primary recommendation)
   - Supports both React and Svelte implementations
   - Comprehensive component and blocks access
   - Active maintenance and updates

2. **@heilgar/shadcn-ui-mcp-server**
   - Listed on mcpservers.org directory
   - Reliable alternative option

3. **@PrimeDX/shadcn-mcp**
   - GitHub-based implementation
   - Direct repository integration

### MCP Installation & Configuration

#### For Claude Desktop Users

**Step 1: Locate Configuration File**
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

**Step 2: Configure MCP Server**
```json
{
  "mcpServers": {
    "shadcn-ui-server": {
      "command": "npx",
      "args": ["@jpisnice/shadcn-ui-mcp-server"]
    }
  }
}
```

**Step 3: Enhanced Configuration with GitHub Token (Recommended)**
For better rate limits (5000 requests/hour vs 60):
```json
{
  "mcpServers": {
    "shadcn-ui-server": {
      "command": "npx",
      "args": [
        "@jpisnice/shadcn-ui-mcp-server",
        "--github-api-key",
        "ghp_your_token_here"
      ]
    }
  }
}
```

**Step 4: Restart Claude Desktop**
After configuration, restart Claude Desktop to load the MCP server.

#### For Other MCP-Compatible Clients

**VS Code with Continue.dev**
```json
{
  "mcpServers": {
    "shadcn-ui": {
      "command": "npx",
      "args": ["@jpisnice/shadcn-ui-mcp-server"]
    }
  }
}
```

**Cursor IDE**
Configure in your Cursor settings or project configuration.

### MCP Usage Patterns

#### Basic Component Retrieval
```javascript
/**
 * Request component information through MCP
 * @mcp Fetching latest Button component from shadcn/ui
 */
// Claude Code can now access:
// - Latest Button component source
// - Usage examples and demos
// - Dependencies and configuration
// - TypeScript definitions
```

#### Advanced Component Queries
```javascript
/**
 * Complex component requests through MCP
 * @mcp Accessing DataTable with TanStack integration
 */
// Available through MCP:
// - Complete DataTable implementation
// - Pagination, sorting, filtering examples
// - Performance optimization patterns
// - Accessibility implementations
```

#### Block-Level Implementations
```javascript
/**
 * Full-featured blocks through MCP
 * @mcp Dashboard block with charts and metrics
 */
// MCP provides:
// - Complete dashboard layouts
// - Authentication forms
// - Calendar components
// - E-commerce interfaces
```

### Available MCP Tools

When properly configured, these tools become available:

#### Core Component Tools
- **list_shadcn_components**: Get all available components
- **get_component_details**: Detailed component information
- **get_component_source**: Latest component source code
- **list_component_demos**: Available demo implementations

#### Block Management Tools
- **list_blocks**: Available pre-built blocks
- **get_block_details**: Complete block implementation
- **get_block_dependencies**: Required dependencies for blocks

#### Metadata Tools
- **get_component_dependencies**: Required packages and versions
- **get_installation_guide**: Framework-specific setup instructions
- **search_components**: Find components by functionality

### MCP Integration Best Practices

#### When to Use MCP
```javascript
/**
 * Use MCP for these scenarios:
 * @mcp Verify component exists and get latest implementation
 */
// ✅ Good uses:
// - Getting latest component source
// - Checking new component releases
// - Finding component dependencies
// - Accessing complex block implementations
// - Verifying component APIs have changed

// ❌ Avoid MCP for:
// - Basic component usage (use local docs)
// - Simple styling questions
// - Tailwind CSS utilities
// - General React patterns
```

#### MCP + RefTools Integration
```javascript
/**
 * Combine MCP with RefTools for comprehensive verification
 * @mcp Get latest component from shadcn/ui repository
 * @reftools Verify against official documentation patterns
 */
const ComponentImplementation = () => {
  // MCP provides latest source
  // RefTools verifies documentation accuracy
  // Combined approach ensures correctness
}
```

#### Error Handling for MCP
```javascript
/**
 * Handle MCP server unavailability gracefully
 * @mcp Attempted to fetch component, falling back to cached version
 */
// Always have fallback strategies:
// 1. Use MCP for latest source
// 2. Fall back to RefTools documentation
// 3. Use local component implementations
// 4. Reference this document's examples
```

### Troubleshooting MCP Issues

#### Common Problems

1. **MCP Server Not Starting**
   ```bash
   # Check if server is accessible
   npx @jpisnice/shadcn-ui-mcp-server --help
   
   # Verify configuration
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

2. **Rate Limit Exceeded**
   ```bash
   # Add GitHub token for higher limits
   npx @jpisnice/shadcn-ui-mcp-server --github-api-key ghp_your_token
   ```

3. **Component Not Found**
   ```javascript
   /**
    * @mcp Component may be new or renamed, check alternatives
    */
   // Try different component names
   // Check if component exists in latest version
   // Use list_shadcn_components to see available options
   ```

#### Verification Steps
```bash
# 1. Test MCP server directly
npx @jpisnice/shadcn-ui-mcp-server

# 2. Check Claude Desktop logs (macOS)
tail -f ~/Library/Logs/Claude/claude_desktop.log

# 3. Verify JSON configuration
jq . ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### MCP Performance Optimization

#### Caching Strategies
The MCP server implements intelligent caching:
- Component source code cached for 1 hour
- Metadata cached for 24 hours
- GitHub API responses cached appropriately
- Automatic cache invalidation on new releases

#### Best Practices for Performance
```javascript
/**
 * Optimize MCP usage for better performance
 * @mcp Batch component requests when possible
 */
// ✅ Efficient:
// - Request multiple related components together
// - Use component lists before detailed queries
// - Cache results locally when appropriate

// ❌ Inefficient:
// - Individual requests for each component
// - Repeated requests for same component
// - Ignoring cached responses
```

## Philosophy & Approach
shadcn/ui follows these principles that align perfectly with our development standards:
- **Copy, don't install**: Components become part of your codebase
- **Customizable**: Built with Tailwind CSS for easy theming
- **Accessible**: Built on Radix UI primitives
- **Type-safe**: Full TypeScript support
- **Framework agnostic**: Works with Next.js, Vite, Remix, etc.

## Installation & Setup

### Framework Selection Priority
When choosing shadcn/ui integration, prioritize based on project needs:

1. **Next.js 14+ (App Router)** - Recommended for full-stack applications
   ```bash
   npx create-next-app@latest my-app --typescript --tailwind --eslint
   cd my-app
   npx shadcn@latest init
   ```

2. **Vite + React** - For frontend-only applications
   ```bash
   npm create vite@latest my-app -- --template react-ts
   cd my-app
   npx shadcn@latest init
   ```

3. **Other React frameworks** - Astro, Remix, etc. (see official docs)

### Configuration Standards

#### components.json Configuration
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york", // Use "new-york" for production apps
  "rsc": true, // Enable for Next.js App Router
  "tsx": true, // Always use TypeScript
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "zinc", // Professional default
    "cssVariables": true // Enable CSS variables for theming
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

#### Required Dependencies
```json
{
  "dependencies": {
    "@radix-ui/react-*": "latest", // Installed per component
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

### Essential Setup Files

#### lib/utils.ts (REQUIRED)
```typescript
/**
 * @file lib/utils.ts
 * @description Core utility functions for shadcn/ui components
 * @reftools Verified against clsx v2.x and tailwind-merge v2.x
 */
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

#### globals.css (Base Styles)
```css
/* @tailwind directives */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* shadcn/ui CSS variables for theming */
/* @reftools Verified against CSS custom properties best practices */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;

    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;

    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;

    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;

    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;

    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;

    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;

    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 94.0%;
  }
}

/* Base styles for better defaults */
@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground;
  }
}
```

## Component Categories & Usage Patterns

### 1. Layout Components

#### Card Component
**Use for**: Content containers, feature displays, product cards
```typescript
/**
 * Enhanced Card component with semantic structure
 * @reftools Verified against shadcn/ui Card component API
 */
<Card className="w-full max-w-md">
  <CardHeader>
    <CardTitle>User Profile</CardTitle>
    <CardDescription>
      Manage your account settings and preferences
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {/* Content */}
    </div>
  </CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="outline">Cancel</Button>
    <Button>Save Changes</Button>
  </CardFooter>
</Card>
```

#### Sheet Component
**Use for**: Mobile-friendly drawers, settings panels, navigation
```typescript
/**
 * Sheet for mobile-responsive navigation
 * @reftools Verified against Radix Dialog primitives
 */
<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline" size="icon" className="md:hidden">
      <Menu className="h-4 w-4" />
      <span className="sr-only">Toggle menu</span>
    </Button>
  </SheetTrigger>
  <SheetContent side="left" className="w-80">
    <SheetHeader>
      <SheetTitle>Navigation</SheetTitle>
      <SheetDescription>
        Access all application features
      </SheetDescription>
    </SheetHeader>
    <div className="mt-6">
      <NavigationItems />
    </div>
  </SheetContent>
</Sheet>
```

### 2. Form Components

#### Form Component (React Hook Form + Zod)
**Always use for**: Complex forms with validation
```typescript
/**
 * Production-ready form with validation
 * @reftools Verified against React Hook Form v7.x and Zod v3.x
 * @supabase Can integrate with Supabase auth and data operations
 */
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
})

type FormData = z.infer<typeof formSchema>

export function LoginForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: FormData) {
    try {
      // @supabase Example: Supabase auth integration
      const { error } = await supabase.auth.signInWithPassword(values)
      if (error) throw error
      
      toast.success("Signed in successfully")
    } catch (error) {
      toast.error("Invalid credentials")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="Enter your email"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                We'll never share your email with anyone else.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Enter your password"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Sign In
        </Button>
      </form>
    </Form>
  )
}
```

#### Advanced Input Patterns
```typescript
/**
 * Enhanced input components with proper validation states
 * @reftools Verified against HTML5 input specifications
 */

// Search input with debouncing
const SearchInput = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [query, setQuery] = useState("")
  
  const debouncedSearch = useMemo(
    () => debounce((q: string) => onSearch(q), 300),
    [onSearch]
  )
  
  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])
  
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className="pl-10"
      />
    </div>
  )
}

// File upload with drag and drop
const FileUpload = ({ onUpload }: { onUpload: (files: File[]) => void }) => {
  const [isDragging, setIsDragging] = useState(false)
  
  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-border"
      )}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        const files = Array.from(e.dataTransfer.files)
        onUpload(files)
      }}
    >
      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
      <p className="mt-4 text-sm text-muted-foreground">
        Drag and drop files here, or click to select files
      </p>
      <Input
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || [])
          onUpload(files)
        }}
      />
    </div>
  )
}
```

### 3. Data Display Components

#### Table Component (TanStack Table Integration)
**Use for**: Complex data tables with sorting, filtering, pagination
```typescript
/**
 * Production-ready data table implementation
 * @reftools Verified against TanStack Table v8.x API
 * @supabase Optimized for Supabase data operations and real-time updates
 */

// Column definitions with proper typing
export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("email")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge 
          variant={status === "active" ? "default" : "secondary"}
          className="capitalize"
        >
          {status}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.id)}
            >
              Copy user ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              View profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit user
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash className="mr-2 h-4 w-4" />
              Delete user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

// Enhanced DataTable component
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchableColumns?: {
    id: keyof TData
    placeholder: string
  }[]
  filterableColumns?: {
    id: keyof TData
    title: string
    options: { label: string; value: string }[]
  }[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchableColumns = [],
  filterableColumns = [],
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          {searchableColumns.map((column) => (
            <Input
              key={String(column.id)}
              placeholder={column.placeholder}
              value={(table.getColumn(String(column.id))?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn(String(column.id))?.setFilterValue(event.target.value)
              }
              className="h-8 w-[150px] lg:w-[250px]"
            />
          ))}
          
          {filterableColumns.map((column) => (
            <DataTableFacetedFilter
              key={String(column.id)}
              column={table.getColumn(String(column.id))}
              title={column.title}
              options={column.options}
            />
          ))}
          
          {(table.getColumn("status")?.getFilterValue() as string[])?.length > 0 && (
            <Button
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
        
        <DataTableViewOptions table={table} />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center justify-center py-8">
                    <Search className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No results found.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Try adjusting your search or filter criteria.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DataTablePagination table={table} />
    </div>
  )
}
```

### 4. Navigation Components

#### Command Component (⌘K Menu)
**Use for**: App-wide search, command palette, quick actions
```typescript
/**
 * Command palette for application navigation
 * @reftools Verified against cmdk library API
 */
export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const [pages, setPages] = useState<string[]>([])
  const page = pages[pages.length - 1]

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {!page && (
          <>
            <CommandGroup heading="Quick Actions">
              <CommandItem onSelect={() => router.push("/dashboard")}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Go to Dashboard
              </CommandItem>
              <CommandItem onSelect={() => router.push("/users")}>
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </CommandItem>
              <CommandItem onSelect={() => setPages([...pages, "settings"])}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
                <CommandShortcut>⌘S</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            
            <CommandGroup heading="Recent">
              <CommandItem>
                <File className="mr-2 h-4 w-4" />
                Project Alpha
              </CommandItem>
              <CommandItem>
                <File className="mr-2 h-4 w-4" />
                User Report
              </CommandItem>
            </CommandGroup>
          </>
        )}
        
        {page === "settings" && (
          <CommandGroup heading="Settings">
            <CommandItem>
              <User className="mr-2 h-4 w-4" />
              Profile Settings
            </CommandItem>
            <CommandItem>
              <Palette className="mr-2 h-4 w-4" />
              Theme
            </CommandItem>
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
```

### 5. Feedback Components

#### Toast Notifications
```typescript
/**
 * Toast system for user feedback
 * @reftools Verified against sonner toast library
 */
import { toast } from "sonner"

// Success notification
export const showSuccess = (message: string, description?: string) => {
  toast.success(message, {
    description,
    duration: 4000,
    action: {
      label: "Dismiss",
      onClick: () => console.log("Dismissed"),
    },
  })
}

// Error notification with retry
export const showError = (message: string, onRetry?: () => void) => {
  toast.error(message, {
    duration: 6000,
    action: onRetry ? {
      label: "Retry",
      onClick: onRetry,
    } : undefined,
  })
}

// Loading toast with promise
export const showLoadingToast = <T>(
  promise: Promise<T>,
  {
    loading,
    success,
    error,
  }: {
    loading: string
    success: string | ((data: T) => string)
    error: string | ((error: any) => string)
  }
) => {
  return toast.promise(promise, {
    loading,
    success,
    error,
  })
}

// Usage examples
const handleSave = async () => {
  await showLoadingToast(
    saveUserData(userData),
    {
      loading: "Saving user data...",
      success: "User data saved successfully!",
      error: "Failed to save user data",
    }
  )
}
```

## Theme System & Customization

### CSS Variables Approach
shadcn/ui uses CSS variables for theming, making it easy to create custom themes:

```css
/* Custom theme example */
.theme-blue {
  --primary: 213 94% 68%;
  --primary-foreground: 0 0% 100%;
  --secondary: 213 27% 84%;
  --secondary-foreground: 213 94% 25%;
}

.theme-green {
  --primary: 142 69% 58%;
  --primary-foreground: 0 0% 100%;
  --secondary: 142 33% 84%;
  --secondary-foreground: 142 69% 25%;
}
```

### Dark Mode Implementation
```typescript
/**
 * Theme provider with system preference detection
 * @reftools Verified against next-themes v0.3.x
 */
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

const ThemeProviderContext = createContext<{
  theme: Theme
  setTheme: (theme: Theme) => void
}>({
  theme: "system",
  setTheme: () => null,
})

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")
  return context
}

// Theme toggle component
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

## Advanced Patterns & Best Practices

### 1. Responsive Design Patterns
```typescript
/**
 * Responsive component patterns using Tailwind CSS
 * @reftools Verified against Tailwind CSS v3.x responsive design utilities
 */

// Mobile-first responsive card grid
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {items.map((item) => (
    <Card key={item.id} className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg">{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground">{item.description}</p>
      </CardContent>
      <CardFooter className="pt-2">
        <Button className="w-full" size="sm">
          View Details
        </Button>
      </CardFooter>
    </Card>
  ))}
</div>

// Responsive navigation with mobile drawer
<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div className="container flex h-14 items-center">
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <Logo className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">
          Your App
        </span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/users">Users</Link>
        <Link href="/settings">Settings</Link>
      </nav>
    </div>
    
    {/* Mobile menu */}
    <Sheet>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <MobileNavigation />
      </SheetContent>
    </Sheet>
    
    <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
      <div className="w-full flex-1 md:w-auto md:flex-none">
        <CommandMenu />
      </div>
      <nav className="flex items-center">
        <ThemeToggle />
        <UserMenu />
      </nav>
    </div>
  </div>
</header>
```

### 2. Form Composition Patterns
```typescript
/**
 * Reusable form components with proper composition
 * @reftools Verified against React Hook Form v7.x composition patterns
 */

// Reusable form field wrapper
interface FormFieldWrapperProps {
  label: string
  required?: boolean
  description?: string
  error?: string
  children: React.ReactNode
}

export function FormFieldWrapper({
  label,
  required = false,
  description,
  error,
  children,
}: FormFieldWrapperProps) {
  const id = useId()
  
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium leading-none">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {React.cloneElement(children as React.ReactElement, { id })}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}

// Usage in forms
<FormFieldWrapper
  label="Email Address"
  required
  description="We'll use this to send you notifications"
  error={errors.email?.message}
>
  <Input
    type="email"
    placeholder="Enter your email"
    {...register("email")}
  />
</FormFieldWrapper>
```

### 3. Loading and Error States
```typescript
/**
 * Consistent loading and error state patterns
 * @reftools Verified against React Suspense and Error Boundary patterns
 */

// Loading skeleton components
export function TableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-8 w-[100px]" />
      </div>
      <div className="rounded-md border">
        <div className="p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 py-3">
              <Skeleton className="h-4 w-[300px]" />
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-8 w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Error boundary component
interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center text-destructive">
          <AlertTriangle className="mr-2 h-5 w-5" />
          Something went wrong
        </CardTitle>
        <CardDescription>
          An error occurred while loading this content.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <details className="mb-4">
          <summary className="cursor-pointer text-sm font-medium">
            Error details
          </summary>
          <pre className="mt-2 text-xs text-muted-foreground bg-muted p-2 rounded">
            {error.message}
          </pre>
        </details>
      </CardContent>
      <CardFooter>
        <Button onClick={resetErrorBoundary} className="w-full">
          Try again
        </Button>
      </CardFooter>
    </Card>
  )
}

// Empty state component
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-6 text-sm text-muted-foreground max-w-sm">{description}</p>
      {action}
    </div>
  )
}
```

## Integration with Backend Services

### Supabase Integration Patterns
```typescript
/**
 * shadcn/ui + Supabase integration patterns
 * @reftools Verified against Supabase JS v2.x
 * @supabase Enhanced with shadcn/ui form and table components
 */

// User profile form with Supabase
export function UserProfileForm() {
  const supabase = createClientComponentClient<Database>()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (profile) {
            form.reset(profile)
          }
        }
      } catch (error) {
        toast.error('Error loading profile')
      } finally {
        setLoading(false)
      }
    }

    getProfile()
  }, [supabase, form])

  async function onSubmit(values: ProfileFormData) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('profiles')
        .update(values)
        .eq('id', user?.id)
      
      if (error) throw error
      
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  if (loading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Manage your account settings and preferences.
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your display name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about yourself"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Brief description for your profile.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save changes
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

// Real-time data table with Supabase
export function UsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    // Initial fetch
    async function fetchUsers() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setUsers(data)
      if (error) toast.error('Failed to load users')
      setLoading(false)
    }

    fetchUsers()

    // Set up real-time subscription
    const channel = supabase
      .channel('profiles')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setUsers(current => [payload.new as User, ...current])
          } else if (payload.eventType === 'UPDATE') {
            setUsers(current => 
              current.map(user => 
                user.id === payload.new.id ? payload.new as User : user
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setUsers(current => 
              current.filter(user => user.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  if (loading) {
    return <TableSkeleton />
  }

  return (
    <DataTable
      columns={userColumns}
      data={users}
      searchableColumns={[
        { id: "email", placeholder: "Search emails..." },
        { id: "display_name", placeholder: "Search names..." },
      ]}
      filterableColumns={[
        {
          id: "status",
          title: "Status",
          options: [
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ],
        },
      ]}
    />
  )
}
```

## Performance Optimization

### Component Optimization
```typescript
/**
 * Performance optimization patterns for shadcn/ui components
 * @reftools Verified against React performance best practices
 */

// Memoized heavy components
const ExpensiveDataTable = memo(function ExpensiveDataTable({
  data,
  columns,
}: DataTableProps) {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      computed: expensiveComputation(item),
    }))
  }, [data])

  return <DataTable data={processedData} columns={columns} />
})

// Virtualized table for large datasets
import { useVirtualizer } from '@tanstack/react-virtual'

export function VirtualizedTable({ data }: { data: any[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  })

  return (
    <div
      ref={parentRef}
      className="h-[400px] overflow-auto"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <div className="p-4 border-b">
              {JSON.stringify(data[virtualItem.index])}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Testing Strategies

### Component Testing
```typescript
/**
 * Testing patterns for shadcn/ui components
 * @reftools Verified against Testing Library best practices
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

// Test wrapper with theme provider
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Toaster />
      {children}
    </ThemeProvider>
  )
}

describe('UserProfileForm', () => {
  it('should render form fields correctly', () => {
    render(<UserProfileForm />, { wrapper: TestWrapper })
    
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/bio/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })

  it('should validate form fields', async () => {
    const user = userEvent.setup()
    render(<UserProfileForm />, { wrapper: TestWrapper })
    
    const submitButton = screen.getByRole('button', { name: /save changes/i })
    await user.click(submitButton)
    
    expect(await screen.findByText(/display name is required/i)).toBeInTheDocument()
  })

  it('should submit form with valid data', async () => {
    const mockSubmit = vi.fn()
    const user = userEvent.setup()
    
    render(<UserProfileForm onSubmit={mockSubmit} />, { wrapper: TestWrapper })
    
    await user.type(screen.getByLabelText(/display name/i), 'John Doe')
    await user.type(screen.getByLabelText(/bio/i), 'Software developer')
    await user.click(screen.getByRole('button', { name: /save changes/i }))
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        display_name: 'John Doe',
        bio: 'Software developer',
      })
    })
  })
})

// Visual regression testing with Chromatic/Storybook
export default {
  title: 'Components/UserProfileForm',
  component: UserProfileForm,
  decorators: [(Story) => <TestWrapper><Story /></TestWrapper>],
}

export const Default = {}
export const WithData = {
  args: {
    defaultValues: {
      display_name: 'John Doe',
      bio: 'Software developer',
    },
  },
}
export const Loading = {
  parameters: {
    msw: {
      handlers: [
        // Mock delayed response
      ],
    },
  },
}
```

## Deployment & Build Optimization

### Bundle Optimization
```typescript
/**
 * Build optimization for shadcn/ui components
 * @reftools Verified against Vite/Next.js build optimization practices
 */

// next.config.js optimizations
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
  transpilePackages: ['lucide-react'],
  // Bundle analyzer
  bundleAnalyzer: {
    enabled: process.env.ANALYZE === 'true',
  },
}

// Tree-shaking imports
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// ✅ Good - only imports what's needed

// ❌ Avoid - imports entire module
import * as Card from '@/components/ui/card'
```

## Migration & Upgrade Strategies

### Upgrading Components
```bash
# Check for component updates
npx shadcn@latest diff

# Update specific component
npx shadcn@latest update button

# Update all components
npx shadcn@latest update
```

### Version Compatibility
- Always check component changelog before updating
- Test thoroughly in development environment
- Use TypeScript for compile-time error detection
- Monitor bundle size after updates

## Troubleshooting Guide

### Common Issues

1. **CSS Variables Not Working**
   ```css
   /* Ensure CSS variables are properly defined */
   :root {
     --background: 0 0% 100%;
     /* Add missing variables */
   }
   ```

2. **Components Not Styling Correctly**
   ```typescript
   // Ensure cn utility is imported
   import { cn } from "@/lib/utils"
   
   // Check Tailwind config includes shadcn paths
   content: [
     "./components/**/*.{js,ts,jsx,tsx}",
   ]
   ```

3. **TypeScript Errors**
   ```typescript
   // Ensure proper type imports
   import type { ComponentProps } from "react"
   
   interface ButtonProps extends ComponentProps<"button"> {
     variant?: "default" | "secondary"
   }
   ```

4. **Dark Mode Not Working**
   ```typescript
   // Ensure ThemeProvider wraps app
   export default function RootLayout() {
     return (
       <html lang="en" suppressHydrationWarning>
         <body>
           <ThemeProvider>
             {children}
           </ThemeProvider>
         </body>
       </html>
     )
   }
   ```

## Conclusion

This enhanced reference provides comprehensive guidelines for using shadcn/ui effectively within the Claude Code development standards. Always refer to the official documentation for the latest updates and verify component APIs using RefTools when implementing complex features.

**Key Takeaways:**
1. **Configure MCP first**: Set up shadcn MCP server for real-time component access
2. Use shadcn/ui for production-ready, customizable components
3. Follow established patterns for forms, tables, and navigation
4. Integrate properly with Supabase for full-stack applications
5. Implement proper loading, error, and empty states
6. Optimize for performance and accessibility
7. Test components thoroughly with proper tooling
8. Keep components updated and monitor bundle size

**Recommended Workflow:**
1. Configure shadcn MCP server in Claude Desktop
2. Use MCP tools to fetch latest component implementations
3. Fall back to RefTools for documentation verification
4. Reference this document for integration patterns
5. Test and optimize implementations

For the most current component APIs and patterns, use the configured MCP server first, then refer to https://ui.shadcn.com and use RefTools for verification.