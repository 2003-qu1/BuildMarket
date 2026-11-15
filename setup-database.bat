@echo off
title Build Market - Database Setup
echo ========================================================
echo Importing building_materials_db.sql into MySQL (XAMPP)
echo ========================================================

set MYSQL_BIN=C:\xampp\mysql\bin\mysql.exe

if not exist "%MYSQL_BIN%" (
    echo [ERROR] MySQL binary was not found at C:\xampp\mysql\bin\mysql.exe
    echo Please make sure XAMPP is installed or import manually via phpMyAdmin:
    echo http://localhost/phpmyadmin/
    pause
    exit /b 1
)

echo Importing database schema and realistic seed data...
"%MYSQL_BIN%" -u root -e "SOURCE %~dp0database\building_materials_db.sql;"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Database 'building_materials_db' was created and seeded successfully!
    echo Tables created: users, admins, categories, products, orders, order_items, payments, addresses, inventory.
) else (
    echo.
    echo [NOTICE] If MySQL service is not running, please start MySQL from the XAMPP Control Panel first.
    echo Alternatively, import building_materials_db.sql manually in phpMyAdmin.
)

pause
