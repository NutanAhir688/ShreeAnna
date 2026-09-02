import {
  Bell,
  ChevronDown,
  Search,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


function Topbar() {
  return (
    <header className="sticky top-0 z-30 h-16 border-b bg-background">
      <div className="flex h-full items-center justify-between px-6">

        {/* Left side */}
        <div className="flex items-center gap-4">

          <div>
            <h2 className="text-lg font-semibold">
              Dashboard
            </h2>

            <p className="text-xs text-muted-foreground">
              Overview of your FPO
            </p>
          </div>

        </div>


        {/* Right side */}
        <div className="flex items-center gap-3">

          {/* Search */}
          <div className="relative hidden w-64 md:block">

            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search..."
              className="pl-9"
            />

          </div>


          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
          >
            <Bell className="h-5 w-5" />

            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
          </Button>


          {/* User menu */}
          <DropdownMenu>

            <DropdownMenuTrigger asChild>

              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2"
              >

                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />

                  <AvatarFallback>
                    RP
                  </AvatarFallback>
                </Avatar>


                <div className="hidden text-left md:block">
                  <p className="text-sm font-medium">
                    Rajesh Patel
                  </p>

                  <p className="text-xs text-muted-foreground">
                    FPO Admin
                  </p>
                </div>


                <ChevronDown className="h-4 w-4 text-muted-foreground" />

              </Button>

            </DropdownMenuTrigger>


            <DropdownMenuContent
              align="end"
              className="w-56"
            >

              <DropdownMenuLabel>
                My Account
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem>
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem>
                Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="text-destructive">
                Logout
              </DropdownMenuItem>

            </DropdownMenuContent>

          </DropdownMenu>

        </div>

      </div>
    </header>
  );
}

export default Topbar;